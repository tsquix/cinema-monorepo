import { ConnectRouter } from "@connectrpc/connect";
import { BookingService, Status } from "@cinema/proto";
import {
  getSeatsByShowing,
  lockSeat,
  releaseSeat,
} from "./services/booking.js";
import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { SeatChangeEvent, seatEvents } from "./events.js";

export const routes = (router: ConnectRouter) =>
  router.service(BookingService, {
    async getSeatMap(req) {
      console.log(`Pobieram mapę dla seansu: ${req.showingId}`);
      const seats = await getSeatsByShowing(req.showingId);

      return {
        rows: 5,
        cols: 10,
        seats,
      };
    },

    async lockSeat(req) {
      console.log(
        `Próba blokady miejsca ${req.seatId} na seans ${req.showingId}`,
      );

      const result = await lockSeat(req.showingId, req.seatId);

      return {
        reservationToken: result.reservationToken,
        lockExpirationTime: timestampFromDate(result.expirationTime),
      };
    },

    async releaseSeat(req) {
      console.log(`Zwalniam miejsce ${req.seatId} na seans ${req.showingId}`);

      await releaseSeat(req.showingId, req.seatId, req.reservationToken);
      return {};
    },
    async *watchSeatUpdates(req, context) {
      console.log(`Nowy klient nasłuchuje zmian na seans: ${req.showingId}`);

      const queue: SeatChangeEvent[] = [];
      let resolveNext: (() => void) | null = null;

      const listener = (event: SeatChangeEvent) => {
        if (event.showingId === req.showingId) {
          queue.push(event);
          if (resolveNext) {
            resolveNext();
            resolveNext = null;
          }
        }
      };

      seatEvents.on("seatChanged", listener);

      try {
        while (!context.signal.aborted) {
          if (queue.length === 0) {
            await new Promise<void>((resolve) => {
              resolveNext = resolve;
              context.signal.addEventListener("abort", () => resolve(), {
                once: true,
              });
            });
          }

          while (queue.length > 0) {
            const event = queue.shift()!;
            yield {
              seatId: event.seatId,
              status: event.status,
            };
          }
        }
      } finally {
        console.log(`Klient rozłączył się z seansu: ${req.showingId}`);
        seatEvents.off("seatChanged", listener);
      }
    },
  });

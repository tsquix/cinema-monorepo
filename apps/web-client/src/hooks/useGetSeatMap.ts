import { useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingClient } from "../client";
import { useEffect } from "react";
import type { Seat } from "@cinema/proto";

export const seatMapQueryKey = (showingId: string) =>
  ["seats", showingId] as const;

export const useGetSeatMap = (showingId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const abortController = new AbortController();

    async function listenToStream() {
      try {
        for await (const update of bookingClient.watchSeatUpdates(
          { showingId },
          { signal: abortController.signal },
        )) {
          queryClient.setQueryData<Seat[]>(
            seatMapQueryKey(showingId),
            (oldSeats) => {
              if (!oldSeats) return [];
              return oldSeats.map((seat) =>
                seat.seatId === update.seatId
                  ? { ...seat, status: update.status }
                  : seat,
              );
            },
          );
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error("Błąd strumienia:", err);
        }
      }
    }

    listenToStream();
    return () => abortController.abort();
  }, [showingId, queryClient]);

  return useQuery({
    queryKey: seatMapQueryKey(showingId),
    queryFn: async () => {
      const res = await bookingClient.getSeatMap({ showingId });
      return res.seats;
    },
  });
};

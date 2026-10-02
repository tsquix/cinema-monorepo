import { useEffect, useMemo, useRef } from "react";
import type { Seat } from "@cinema/proto";
import { useGetSeatMap } from "../hooks/useGetSeatMap";
import { useSeatReservation } from "../hooks/useSeatReservation";
import { useEvent } from "../hooks/useEvent";
import { SeatGrid } from "./SeatGrid";
import { SeatLegend } from "./SeatLegend";

const SHOWING_ID = "matrix-20:00";
export const SeatReservationView = () => {
  const { data: seats = [], isLoading } = useGetSeatMap(SHOWING_ID);
  const { toggleSeat, isMySeat, isPending, error } =
    useSeatReservation(SHOWING_ID);

  const seatsRef = useRef(seats);
  useEffect(() => {
    seatsRef.current = seats;
  }, [seats]);

  // Stable identity so updates streamed over gRPC don't invalidate every memoized SeatButton.
  const handleSelectSeat = useEvent((seatId: string) => {
    const seat = seatsRef.current.find((s) => s.seatId === seatId);
    if (seat) toggleSeat(seat);
  });

  const mySeatIds = useMemo(
    () =>
      new Set(
        seats
          .filter((seat: Seat) => isMySeat(seat.seatId))
          .map((seat: Seat) => seat.seatId),
      ),
    [seats, isMySeat],
  );

  if (isLoading) {
    return (
      <h2 className="p-10 text-center text-muted-foreground">
        Ładowanie sali...
      </h2>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-10 text-center">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          🎬 Kino: {SHOWING_ID}
        </h1>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-2 font-medium text-destructive">
          {error.message}
        </div>
      )}

      <SeatGrid
        seats={seats}
        mySeatIds={mySeatIds}
        disabled={isPending}
        onSelectSeat={handleSelectSeat}
      />

      <SeatLegend />
    </div>
  );
};

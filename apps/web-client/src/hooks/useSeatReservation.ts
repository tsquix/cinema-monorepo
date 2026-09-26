import { useMutation } from "@tanstack/react-query";
import { bookingClient } from "../client";
import { useState } from "react";
import { Status, type Seat } from "@cinema/proto";

export const useSeatReservation = (showingId: string) => {
  const [myTokens, setMyTokens] = useState<Record<string, string>>({});
  const lockMutation = useMutation({
    mutationFn: async (seatId: string) => {
      return await bookingClient.lockSeat({
        showingId,
        seatId,
      });
    },
    onSuccess: (res, seatId) => {
      setMyTokens((prev) => ({ ...prev, [seatId]: res.reservationToken }));
    },
  });

  const releaseMutation = useMutation({
    mutationFn: async (seatId: string) => {
      return await bookingClient.releaseSeat({
        showingId,
        seatId,
        reservationToken: myTokens[seatId],
      });
    },
    onSuccess: (_, seatId) => {
      setMyTokens((prev) => {
        const copy = { ...prev };
        delete copy[seatId];
        return copy;
      });
    },
  });

  const toggleSeat = (seat: Seat) => {
    if (seat.status === Status.FREE) {
      lockMutation.mutate(seat.seatId);
    } else if (seat.status === Status.RESERVED && myTokens[seat.seatId]) {
      releaseMutation.mutate(seat.seatId);
    }
  };
  return {
    toggleSeat,
    isMySeat: (seatId: string) => Boolean(myTokens[seatId]),
    isPending: lockMutation.isPending || releaseMutation.isPending,
    error: lockMutation.error || releaseMutation.error,
  };
};

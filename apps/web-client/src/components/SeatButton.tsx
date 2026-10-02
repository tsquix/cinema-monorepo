import { memo } from "react";
import { Status } from "@cinema/proto";
import { cn } from "../lib/cn";
import { getSeatState, seatButtonVariants } from "./seat-button.variants";

interface SeatButtonProps {
  seatId: string;
  status: Status;
  isSelected: boolean;
  disabled: boolean;
  onSelect: (seatId: string) => void;
}

const STATE_LABELS: Record<ReturnType<typeof getSeatState>, string> = {
  available: "wolne",
  selected: "Twoja rezerwacja",
  locked: "zajęte przez kogoś",
  sold: "kupione",
};

export const SeatButton = memo(function SeatButton({
  seatId,
  status,
  isSelected,
  disabled,
  onSelect,
}: SeatButtonProps) {
  const state = getSeatState(status, isSelected);
  const isSold = status === Status.BOUGHT;

  return (
    <button
      type="button"
      onClick={() => onSelect(seatId)}
      disabled={isSold || disabled}
      aria-pressed={isSelected}
      aria-label={`Miejsce ${seatId}, ${STATE_LABELS[state]}`}
      className={cn(seatButtonVariants({ state, pending: disabled }))}
    >
      {seatId}
    </button>
  );
});

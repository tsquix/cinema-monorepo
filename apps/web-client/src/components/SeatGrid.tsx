import { useMemo } from "react";
import type { Seat } from "@cinema/proto";
import { SeatButton } from "./SeatButton";

interface SeatGridProps {
  seats: Seat[];
  mySeatIds: ReadonlySet<string>;
  disabled: boolean;
  onSelectSeat: (seatId: string) => void;
}

const ROW_PREFIX_PATTERN = /^[A-Z]+/;

export function SeatGrid({
  seats,
  mySeatIds,
  disabled,
  onSelectSeat,
}: SeatGridProps) {
  const seatsByRow = useMemo(() => {
    return seats.reduce<Record<string, Seat[]>>((groups, seat) => {
      const row = seat.seatId.match(ROW_PREFIX_PATTERN)?.[0] ?? "?";
      (groups[row] ??= []).push(seat);
      return groups;
    }, {});
  }, [seats]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        aria-hidden="true"
        className="h-3 w-full max-w-2xl rounded-[50%] bg-gradient-to-b from-foreground/40 to-transparent shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
      />
      <div className="flex flex-col gap-3">
        {Object.entries(seatsByRow).map(([row, rowSeats]) => (
          <div
            key={row}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          >
            <span className="w-5 text-sm font-medium text-muted-foreground">
              {row}
            </span>
            {rowSeats.map((seat) => (
              <SeatButton
                key={seat.seatId}
                seatId={seat.seatId}
                status={seat.status}
                isSelected={mySeatIds.has(seat.seatId)}
                disabled={disabled}
                onSelect={onSelectSeat}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

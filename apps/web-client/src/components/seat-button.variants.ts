import { cva, type VariantProps } from "class-variance-authority";
import { Status } from "@cinema/proto";

export type SeatState = "available" | "selected" | "locked" | "sold";

// Maps server status + local selection flag to a single visual state key.
export function getSeatState(status: Status, isSelected: boolean): SeatState {
  if (status === Status.BOUGHT) return "sold";
  if (status === Status.RESERVED) return isSelected ? "selected" : "locked";
  return "available";
}

export const seatButtonVariants = cva(
  "relative flex w-12 h-12 sm:w-14 sm:h-14 items-center justify-center rounded-t-lg rounded-b-sm border-b-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      state: {
        available:
          "bg-muted text-muted-foreground border-muted-foreground/30 hover:bg-muted/70 focus-visible:ring-primary",
        selected:
          "bg-primary text-primary-foreground border-primary/50 shadow-lg shadow-primary/30 hover:bg-primary/90 focus-visible:ring-primary",
        locked:
          "bg-warning text-warning-foreground border-warning/50 cursor-default focus-visible:ring-warning",
        sold: "bg-destructive text-destructive-foreground border-destructive/50 opacity-70 cursor-not-allowed focus-visible:ring-destructive",
      } satisfies Record<SeatState, string>,
      pending: {
        true: "opacity-60 cursor-wait",
        false: "",
      },
    },
    defaultVariants: {
      state: "available",
      pending: false,
    },
  },
);

export type SeatButtonVariantProps = VariantProps<typeof seatButtonVariants>;

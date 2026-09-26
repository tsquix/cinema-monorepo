import { Status, type Seat } from "@cinema/proto";

interface SeatButtonProps {
  seat: Seat;
  isMine: boolean;
  disabled: boolean;
  onClick: (seat: Seat) => void;
}

const getSeatColor = (status: Status, isMine: boolean) => {
  if (status === Status.BOUGHT) return "#ef4444";
  if (status === Status.RESERVED) return isMine ? "#3b82f6" : "#f59e0b";
  return "#22c55e";
};

export function SeatButton({
  seat,
  isMine,
  disabled,
  onClick,
}: SeatButtonProps) {
  const isBought = seat.status === Status.BOUGHT;

  return (
    <button
      onClick={() => onClick(seat)}
      disabled={isBought || disabled}
      style={{
        width: "80px",
        height: "80px",
        fontSize: "20px",
        fontWeight: "bold",
        color: "white",
        backgroundColor: getSeatColor(seat.status, isMine),
        border: "none",
        borderRadius: "12px",
        cursor: isBought ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {seat.seatId}
    </button>
  );
}

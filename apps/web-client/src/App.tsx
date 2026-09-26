import { useGetSeatMap } from "./hooks/useGetSeatMap";
import { useSeatReservation } from "./hooks/useSeatReservation";
import { SeatButton } from "./components/SeatButton";

const SHOWING_ID = "matrix-20:00";

function App() {
  const { data: seats = [], isLoading } = useGetSeatMap(SHOWING_ID);
  const { toggleSeat, isMySeat, isPending, error } =
    useSeatReservation(SHOWING_ID);

  if (isLoading) {
    return <h2 style={{ textAlign: "center" }}>Ładowanie sali...</h2>;
  }

  return (
    <div
      style={{ padding: "40px", fontFamily: "sans-serif", textAlign: "center" }}
    >
      <h1>🎬 Kino: {SHOWING_ID}</h1>
      <div style={{ marginBottom: "20px", color: "#888" }}>
        🟦 Twoja rezerwacja | 🟩 Wolne | 🟧 Zajęte przez kogoś | 🟥 Kupione
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "20px", fontWeight: "bold" }}>
          {error.message}
        </div>
      )}

      <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
        {seats.map((seat) => (
          <SeatButton
            key={seat.seatId}
            seat={seat}
            isMine={isMySeat(seat.seatId)}
            disabled={isPending}
            onClick={toggleSeat}
          />
        ))}
      </div>
    </div>
  );
}

export default App;

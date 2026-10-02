import { Status } from "@cinema/proto";
import { pool } from "../db.js";
import { seatEvents } from "../events.js";

export function cleanStaleSeatReservations() {
  let isRunning = false;

  const interval = setInterval(async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      const res = await pool.query<{ seat_id: string; showing_id: string }>(
        `UPDATE seat_reservations 
   SET status = 'FREE', reservation_token = NULL, locked_until = NULL, version = version + 1 
   WHERE status = 'RESERVED' AND locked_until <= NOW()
   RETURNING seat_id, showing_id`,
      );

      res.rows.forEach(({ showing_id, seat_id }) => {
        seatEvents.emit("seatChanged", {
          showingId: showing_id,
          seatId: seat_id,
          status: Status.FREE,
        });
      });
    } catch (error) {
      console.log(error);
    } finally {
      isRunning = false;
    }
  }, 5000);

  return () => {
    clearInterval(interval);
  };
}

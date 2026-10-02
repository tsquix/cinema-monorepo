import { Status } from "@cinema/proto";
import { pool } from "../db.js";
import { Code, ConnectError } from "@connectrpc/connect";
import { seatEvents } from "../events.js";

const statusMap: Record<string, Status> = {
  FREE: Status.FREE,
  RESERVED: Status.RESERVED,
  BOUGHT: Status.BOUGHT,
};

export async function getSeatsByShowing(showingId: string) {
  const result = await pool.query(
    `SELECT seat_id, status 
     FROM seat_reservations 
     WHERE showing_id = $1
     ORDER BY LEFT(seat_id, 1), CAST(SUBSTRING(seat_id FROM 2) AS INT)`,
    [showingId],
  );
  return result.rows.map((row) => ({
    seatId: row.seat_id,
    status: statusMap[row.status],
  }));
}

export async function lockSeat(showingId: string, seatId: string) {
  const selectResult = await pool.query<{
    status: string;
    version: number;
    is_lock_active: boolean;
  }>(
    `SELECT status, version, (status = 'RESERVED' AND locked_until > NOW()) AS is_lock_active
     FROM seat_reservations 
     WHERE showing_id = $1 AND seat_id = $2`,
    [showingId, seatId],
  );

  if (selectResult.rows.length === 0) {
    throw new ConnectError(`Miejsce ${seatId} nie istnieje`, Code.NotFound);
  }

  const seat = selectResult.rows[0];

  if (seat.status === "BOUGHT" || seat.is_lock_active) {
    throw new ConnectError(
      `Miejsce ${seatId} jest już zajęte!`,
      Code.AlreadyExists,
    );
  }

  const reservationToken = crypto.randomUUID();

  const updateResult = await pool.query<{ locked_until: Date }>(
    `UPDATE seat_reservations 
     SET status = 'RESERVED', 
         reservation_token = $1, 
         locked_until = NOW() + INTERVAL '15 seconds', 
         version = version + 1 
     WHERE showing_id = $2 AND seat_id = $3 AND version = $4
     RETURNING locked_until`,
    [reservationToken, showingId, seatId, seat.version],
  );

  if (updateResult.rowCount === 0) {
    throw new ConnectError(
      `Ktoś inny właśnie zarezerwował miejsce ${seatId}!`,
      Code.Aborted,
    );
  }

  const expirationTime = updateResult.rows[0].locked_until;

  seatEvents.emit("seatChanged", {
    showingId,
    seatId,
    status: Status.RESERVED,
  });

  return {
    reservationToken,
    expirationTime,
  };
}

export async function releaseSeat(
  showingId: string,
  seatId: string,
  reservationToken: string,
) {
  const result = await pool.query(
    `UPDATE seat_reservations 
     SET status = 'FREE', reservation_token = NULL, locked_until = NULL, version = version + 1 
     WHERE showing_id = $1 AND seat_id = $2 AND reservation_token = $3 AND status = 'RESERVED'`,
    [showingId, seatId, reservationToken],
  );
  if (result.rowCount === 0) {
    throw new ConnectError(
      "Nie można zwolnić miejsca: nieprawidłowy token lub miejsce nie jest zarezerwowane.",
      Code.PermissionDenied,
    );
  }
  seatEvents.emit("seatChanged", {
    showingId,
    seatId,
    status: Status.FREE,
  });
}

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
    `SELECT seat_id, status FROM seat_reservations WHERE showing_id =$1`,
    [showingId],
  );
  return result.rows.map((row) => ({
    seatId: row.seat_id,
    status: statusMap[row.status],
  }));
}

export async function lockSeat(showingId: string, seatId: string) {
  const selectResult = await pool.query(
    `SELECT status, version, locked_until 
     FROM seat_reservations 
     WHERE showing_id = $1 AND seat_id = $2`,
    [showingId, seatId],
  );

  if (selectResult.rows.length === 0) {
    throw new ConnectError(`Miejsce ${seatId} nie istnieje`, Code.NotFound);
  }

  const seat = selectResult.rows[0];
  const now = new Date();

  const isLockActive =
    seat.status === "RESERVED" &&
    seat.locked_until &&
    new Date(seat.locked_until) > now;
  if (seat.status === "BOUGHT" || isLockActive) {
    throw new ConnectError(
      `Miejsce ${seatId} jest już zajęte!`,
      Code.AlreadyExists,
    );
  }

  const reservationToken = crypto.randomUUID();
  const expirationTime = new Date(now.getTime() + 5 * 60 * 1000);

  const updateResult = await pool.query(
    `UPDATE seat_reservations 
     SET status = 'RESERVED', reservation_token = $1, locked_until = $2, version = version + 1 
     WHERE showing_id = $3 AND seat_id = $4 AND version = $5`,
    [reservationToken, expirationTime, showingId, seatId, seat.version],
  );

  if (updateResult.rowCount === 0) {
    throw new ConnectError(
      `Ktoś inny właśnie zarezerwował miejsce ${seatId}!`,
      Code.Aborted,
    );
  }
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

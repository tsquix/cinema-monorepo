import { EventEmitter } from "node:events";
import { Status } from "@cinema/proto";

export interface SeatChangeEvent {
  showingId: string;
  seatId: string;
  status: Status;
}

export const seatEvents = new EventEmitter();
seatEvents.setMaxListeners(1000);

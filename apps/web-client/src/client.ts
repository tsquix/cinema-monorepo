import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { BookingService } from "@cinema/proto";

const transport = createConnectTransport({
  baseUrl: "http://localhost:3000",
});

export const bookingClient = createClient(BookingService, transport);

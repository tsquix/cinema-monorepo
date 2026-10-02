//FOR TESTING PURPOSES ONLY
import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { BookingService, Status } from "@cinema/proto";

const transport = createConnectTransport({
  baseUrl: "http://localhost:3000",
  httpVersion: "1.1",
});

const client = createClient(BookingService, transport);

async function main() {
  console.log("Łączę się ze strumieniem dla matrix-20:00...");
  for await (const update of client.watchSeatUpdates({
    showingId: "matrix-20:00",
  })) {
    console.log(
      `LIVE: Miejsce ${update.seatId} zmieniło status na: ${Status[update.status]}`,
    );
  }
}

main();

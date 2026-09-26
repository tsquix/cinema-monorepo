import http from "node:http";
import { connectNodeAdapter } from "@connectrpc/connect-node";
import { routes } from "./routes.js";

const handler = connectNodeAdapter({ routes });

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Connect-Protocol-Version, Connect-Timeout-Ms",
  );

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  handler(req, res);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Serwer gRPC (Connect) nasłuchuje na porcie ${PORT}`);
});

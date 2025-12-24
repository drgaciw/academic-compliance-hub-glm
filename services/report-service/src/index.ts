import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import routes from "./routes";
import { startReportWorker, cleanupExpiredJobs } from "./worker";
import cron from "node-cron";

const app = new Hono();
const port = parseInt(process.env.PORT || "3004");
const host = process.env.HOST || "0.0.0.0";

app.use("*", cors());

app.route("/", routes);

const server = createServer();

app.fire(server);

const wss = new WebSocketServer({ server, path: "/ws/reports" });

wss.on("connection", (ws, req) => {
  const url = req.url || "";
  const clientId =
    new URL(url, `http://${host}`).searchParams.get("clientId") || "anonymous";

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === "subscribe") {
        if (!global.reportConnections) {
          global.reportConnections = new Map();
        }

        if (!global.reportConnections.has(clientId)) {
          global.reportConnections.set(clientId, new Set());
        }

        global.reportConnections.get(clientId)!.add(ws);

        ws.send(
          JSON.stringify({
            type: "subscribed",
            clientId,
            message: "Connected to report updates",
          }),
        );
      } else if (data.type === "unsubscribe") {
        if (global.reportConnections?.has(clientId)) {
          global.reportConnections.get(clientId)!.delete(ws);
        }
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  });

  ws.on("close", () => {
    if (global.reportConnections?.has(clientId)) {
      global.reportConnections.get(clientId)!.delete(ws);
      if (global.reportConnections.get(clientId)!.size === 0) {
        global.reportConnections.delete(clientId);
      }
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

cron.schedule("0 2 * * *", async () => {
  console.log("Running expired report cleanup...");
  try {
    const cleaned = await cleanupExpiredJobs();
    console.log(`Cleaned up ${cleaned} expired reports`);
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
});

if (process.env.START_WORKER === "true") {
  startReportWorker();
}

server.listen(port, host, () => {
  console.log(`Report Service listening on http://${host}:${port}`);
  console.log(`WebSocket endpoint: ws://${host}:${port}/ws/reports`);
});

declare global {
  var reportConnections: Map<string, Set<import("ws").WebSocket>> | undefined;
}

export default app;

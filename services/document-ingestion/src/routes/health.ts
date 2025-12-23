import { Hono } from "hono";

const healthRouter = new Hono();

healthRouter.get("/health", (c) => {
  return c.json({
    status: "healthy",
    service: "document-ingestion",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

export { healthRouter };

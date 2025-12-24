/**
 * @aah/service-eligibility-engine
 * Eligibility evaluation microservice
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { successResponse, errorResponse } from "@aah/api-utils";
import eligibilityRoutes from "./routes/eligibility.js";

const app = new Hono();

app.use("*", cors());

app.get("/health", (c) => {
  return c.json(
    successResponse({ status: "ok", service: "eligibility-engine" }),
  );
});

app.route("/api/eligibility", eligibilityRoutes);

app.onError((err, c) => {
  console.error("Error:", err);
  return c.json(errorResponse("INTERNAL_ERROR", err.message), 500);
});

app.notFound((c) => {
  return c.json(errorResponse("NOT_FOUND", "Endpoint not found"), 404);
});

export default app;

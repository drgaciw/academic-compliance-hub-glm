/**
 * @aah/service-user
 * User management microservice
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  successResponse,
  errorResponse,
  ValidationError,
} from "@aah/api-utils";

const app = new Hono();

// Middleware
app.use("*", cors());

// Health check
app.get("/health", (c) => {
  return c.json(successResponse({ status: "ok", service: "user" }));
});

// Get user profile
app.get("/users/:id", (c) => {
  const id = c.req.param("id");
  // TODO: Implement user lookup from database
  return c.json(
    successResponse({ id, name: "John Doe", email: "john@example.com" }),
  );
});

// Create user
app.post(
  "/users",
  zValidator(
    "json",
    z.object({
      email: z.string().email(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      role: z.enum(["STUDENT", "ADVISOR", "ADMIN", "COMPLIANCE_OFFICER"]),
    }),
  ),
  async (c) => {
    const data = c.req.valid("json");
    // TODO: Implement user creation in database
    return c.json(successResponse({ id: "new-user-id", ...data }), 201);
  },
);

// Update user
app.put(
  "/users/:id",
  zValidator(
    "json",
    z.object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      role: z
        .enum(["STUDENT", "ADVISOR", "ADMIN", "COMPLIANCE_OFFICER"])
        .optional(),
    }),
  ),
  async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    // TODO: Implement user update in database
    return c.json(successResponse({ id, ...data }));
  },
);

// Delete user
app.delete("/users/:id", (c) => {
  const id = c.req.param("id");
  // TODO: Implement user deletion from database
  return c.json(successResponse({ id }));
});

export default app;

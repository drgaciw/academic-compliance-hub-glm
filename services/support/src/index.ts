/**
 * @aah/service-support
 * Tutoring and support microservice
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { successResponse } from "@aah/api-utils";

const app = new Hono();

// Middleware
app.use("*", cors());

// Health check
app.get("/health", (c) => {
  return c.json(successResponse({ status: "ok", service: "support" }));
});

// Get tutoring sessions
app.get("/students/:id/sessions", (c) => {
  const studentId = c.req.param("id");
  // TODO: Implement session lookup
  return c.json(
    successResponse({
      studentId,
      sessions: [
        {
          id: "1",
          subject: "Math",
          date: "2024-01-15",
          duration: 60,
          status: "COMPLETED",
        },
        {
          id: "2",
          subject: "Physics",
          date: "2024-01-20",
          duration: 60,
          status: "SCHEDULED",
        },
      ],
    }),
  );
});

// Create tutoring session
app.post(
  "/students/:id/sessions",
  zValidator(
    "json",
    z.object({
      subject: z.string(),
      date: z.string(),
      duration: z.number(),
      notes: z.string().optional(),
    }),
  ),
  async (c) => {
    const studentId = c.req.param("id");
    const data = c.req.valid("json");
    // TODO: Implement session creation
    return c.json(successResponse({ studentId, ...data }), 201);
  },
);

// Get available tutors
app.get("/tutors", (c) => {
  // TODO: Implement tutor lookup
  return c.json(
    successResponse({
      tutors: [
        { id: "1", name: "Dr. Smith", subjects: ["Math", "Physics"] },
        { id: "2", name: "Prof. Johnson", subjects: ["Chemistry", "Biology"] },
      ],
    }),
  );
});

export default app;

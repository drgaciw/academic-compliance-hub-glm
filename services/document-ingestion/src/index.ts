import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { healthRouter } from "./routes/health";
import { documentRouter } from "./routes/documents";
import { errorHandler } from "./middleware/errorHandler";

const app = new Hono();

app.use("*", cors());
app.use("*", logger());
app.use("*", errorHandler);

app.route("/", healthRouter);
app.route("/documents", documentRouter);

export default app;

import { createLogger, LogLevel } from "../src/index";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const logger = createLogger("log-ingestion");

  try {
    const logData = req.body;

    logger.info("Log received", {
      logData,
      service: "log-ingestion",
      requestId: req.headers["x-request-id"] || "unknown",
    });

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error("Log ingestion error", {
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
    res.status(500).json({ error: "Failed to process log" });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};

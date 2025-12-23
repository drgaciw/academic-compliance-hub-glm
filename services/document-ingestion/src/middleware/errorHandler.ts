import type { Context, Next } from "hono";

export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error("Error in request:", error);

    if (error instanceof Error) {
      return c.json(
        {
          error: error.message,
          status: "error",
        },
        500,
      );
    }

    return c.json(
      {
        error: "An unexpected error occurred",
        status: "error",
      },
      500,
    );
  }
};

import { NextRequest } from "next/server";
import { streamAISearch, type SearchResult } from "@aah/ai";
import {
  SearchAIInputSchema,
  ValidationErrorResponseSchema,
  ValidationErrorSchema,
} from "@aah/schemas";

export const runtime = "edge";
export const dynamic = "force-dynamic";

function createValidationErrorResponse(errors: ValidationErrorSchema[]) {
  return Response.json(
    {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        errors,
      },
    },
    { status: 400 },
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validationResult = SearchAIInputSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
        value: issue.received,
      }));
      return createValidationErrorResponse(errors);
    }

    const { query, searchResults, context } = validationResult.data;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const { answer, citations } = await streamAISearch(
            {
              query,
              searchResults,
              context,
              onChunk: (chunk: string) => {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`),
                );
              },
              onComplete: () => {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ done: true, citations })}\n\n`,
                  ),
                );
                controller.close();
              },
              onError: (error: Error) => {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ error: error.message })}\n\n`,
                  ),
                );
                controller.close();
              },
            },
            {
              temperature: 0.7,
              maxTokens: 2000,
            },
          );
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI search error:", error);
    return Response.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: unknown) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      let counter = 0;

      const interval = setInterval(() => {
        counter++;

        const events = [
          {
            type: "gpa_update",
            data: {
              gpa: (3.0 + Math.random() * 0.5).toFixed(2),
              trend: Math.random() > 0.5 ? "up" : "stable",
              trendValue: (Math.random() * 0.1).toFixed(2),
            },
          },
          {
            type: "compliance_update",
            data: {
              status: ["complete", "in_progress", "pending"][
                Math.floor(Math.random() * 3)
              ],
              requirement: "Core Course Requirements",
            },
          },
          {
            type: "deadline_alert",
            data: {
              daysRemaining: Math.floor(Math.random() * 30),
              title: "Transcript Submission",
              type: "document",
            },
          },
        ];

        const event = events[Math.floor(Math.random() * events.length)];
        sendEvent(event);

        if (counter >= 10) {
          clearInterval(interval);
          controller.close();
        }
      }, 5000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

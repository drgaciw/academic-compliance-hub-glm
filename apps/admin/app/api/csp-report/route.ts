import { NextRequest, NextResponse } from "next/server";
import { CSPReportSchema } from "@aah/schemas";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = CSPReportSchema.safeParse(body);

    if (!result.success) {
      console.error("Invalid CSP report format:", result.error);
      return NextResponse.json(
        { error: "Invalid report format" },
        { status: 400 },
      );
    }

    const report = result.data["csp-report"];

    console.error("CSP Violation Detected (Admin):", {
      documentUri: report["document-uri"],
      violatedDirective: report["violated-directive"],
      blockedUri: report["blocked-uri"],
      sourceFile: report["source-file"],
      lineNumber: report["line-number"],
      columnNumber: report["column-number"],
      userAgent: req.headers.get("user-agent"),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing CSP report:", error);
    return NextResponse.json(
      { error: "Failed to process report" },
      { status: 500 },
    );
  }
}

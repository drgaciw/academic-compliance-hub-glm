import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { query, filters } = await request.json();

    const searchParams = new URLSearchParams();
    if (query) searchParams.append("query", query);
    if (filters.level) searchParams.append("level", filters.level);
    if (filters.service) searchParams.append("service", filters.service);
    if (filters.timeRange) searchParams.append("timeRange", filters.timeRange);

    const vercelLogsUrl = `https://vercel.com/api/logs?${searchParams.toString()}`;

    const response = await fetch(vercelLogsUrl, {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
    });

    const data = await response.json();

    return NextResponse.json({ logs: data.logs || [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to search logs" },
      { status: 500 },
    );
  }
}

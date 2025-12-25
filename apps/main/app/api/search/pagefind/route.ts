import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const searchIndex = await loadPagefindIndex();
    const results = await searchIndex.search(query);

    const formattedResults = await Promise.all(
      results.results.slice(0, 10).map(async (result: any) => {
        const data = await result.data();
        return {
          url: result.url,
          title: data.meta.title || result.url,
          excerpt: data.excerpt || "",
          content: data.content || "",
          metadata: data.meta || {},
        };
      }),
    );

    return NextResponse.json({
      results: formattedResults,
      total: results.results.length,
    });
  } catch (error) {
    console.error("Pagefind search error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 },
    );
  }
}

async function loadPagefindIndex() {
  try {
    const pagefindModule = await import("pagefind");
    const pagefind = await (pagefindModule as any).Pagefind();
    return pagefind.index;
  } catch (error) {
    console.error("Failed to load Pagefind index:", error);
    throw new Error("Search index not available");
  }
}

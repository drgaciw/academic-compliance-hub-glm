import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@aah/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const blobStoreUrl = process.env.BLOB_READ_WRITE_TOKEN
      ? "https://blob.vercel-storage.com"
      : null;

    if (!blobStoreUrl) {
      return NextResponse.json(
        { error: "Blob storage not configured" },
        { status: 500 },
      );
    }

    const filename = `${Date.now()}-${file.name}`;
    const blobResponse = await fetch(`${blobStoreUrl}/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
      body: JSON.stringify({
        filename,
        content: buffer.toString("base64"),
      }),
    });

    if (!blobResponse.ok) {
      const errorData = await blobResponse.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to upload to Blob" },
        { status: blobResponse.status },
      );
    }

    const blobData = await blobResponse.json();

    return NextResponse.json({
      url: blobData.url,
      downloadUrl: blobData.downloadUrl,
      filename: blobData.filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}

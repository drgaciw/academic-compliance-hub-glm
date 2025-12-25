import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Athletic Academics Hub";
  const description =
    searchParams.get("description") ||
    "NCAA Compliance & Academic Support Platform";

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontSize: 60,
        fontWeight: 700,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "60px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
        }}
      >
        <div
          style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "#667eea",
            marginBottom: "20px",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          AAH
        </div>
        <div
          style={{
            fontSize: "48px",
            fontWeight: 800,
            color: "#1a1a1a",
            marginBottom: "20px",
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 400,
            color: "#666666",
            maxWidth: "800px",
          }}
        >
          {description}
        </div>
      </div>
      <div
        style={{
          marginTop: "40px",
          fontSize: "16px",
          color: "rgba(255, 255, 255, 0.8)",
          fontWeight: 500,
        }}
      >
        athleticacademics.com
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}

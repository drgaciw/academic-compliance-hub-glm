import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Student Portal";

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
        backgroundImage: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
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
            fontSize: "48px",
            fontWeight: 800,
            color: "#16a34a",
            marginBottom: "20px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 400,
            color: "#666666",
          }}
        >
          Athletic Academics Hub
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
        Student Portal
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}

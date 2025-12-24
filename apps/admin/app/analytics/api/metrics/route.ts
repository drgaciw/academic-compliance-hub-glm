import { NextResponse } from "next/server";

export async function GET() {
  const performanceData = [
    {
      name: "Week 17",
      ocr: 94,
      processing: 2.3,
      productivity: 85,
      success: 78,
    },
    {
      name: "Week 18",
      ocr: 95,
      processing: 2.1,
      productivity: 88,
      success: 81,
    },
    {
      name: "Week 19",
      ocr: 96,
      processing: 1.9,
      productivity: 90,
      success: 84,
    },
    {
      name: "Week 20",
      ocr: 97,
      processing: 1.7,
      productivity: 92,
      success: 86,
    },
    {
      name: "Week 21",
      ocr: 97.5,
      processing: 1.5,
      productivity: 94,
      success: 88,
    },
    {
      name: "Week 22",
      ocr: 98,
      processing: 1.4,
      productivity: 96,
      success: 91,
    },
  ];

  const metrics = [
    {
      title: "OCR Accuracy",
      value: "98.0%",
      change: "+2.5%",
      positive: true,
    },
    {
      title: "Processing Time",
      value: "1.4s",
      change: "-0.3s",
      positive: true,
    },
    {
      title: "Officer Productivity",
      value: "96%",
      change: "+6%",
      positive: true,
    },
    {
      title: "Student Success",
      value: "91%",
      change: "+5%",
      positive: true,
    },
    {
      title: "Error Rate",
      value: "2.8%",
      change: "-1.2%",
      positive: true,
    },
  ];

  const errorData = [
    { name: "OCR Errors", value: 12, color: "#ef4444" },
    { name: "Data Mapping", value: 8, color: "#f59e0b" },
    { name: "Validation", value: 5, color: "#3b82f6" },
    { name: "Compliance", value: 3, color: "#10b981" },
  ];

  return NextResponse.json({
    performanceData,
    metrics,
    errorData,
    timestamp: new Date().toISOString(),
  });
}

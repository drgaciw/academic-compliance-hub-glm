import { NextResponse } from "next/server";

export async function GET() {
  const systemPerformance = [
    { name: "Week 17", ocr: 94, processing: 2.3, accuracy: 88 },
    { name: "Week 18", ocr: 95, processing: 2.1, accuracy: 90 },
    { name: "Week 19", ocr: 96, processing: 1.9, accuracy: 92 },
    { name: "Week 20", ocr: 97, processing: 1.7, accuracy: 94 },
    { name: "Week 21", ocr: 97.5, processing: 1.5, accuracy: 95 },
    { name: "Week 22", ocr: 98, processing: 1.4, accuracy: 97 },
  ];

  const officerProductivity = [
    { name: "Officer A", cases: 45, hours: 35, efficiency: 1.29 },
    { name: "Officer B", cases: 52, hours: 40, efficiency: 1.3 },
    { name: "Officer C", cases: 38, hours: 30, efficiency: 1.27 },
    { name: "Officer D", cases: 48, hours: 38, efficiency: 1.26 },
    { name: "Officer E", cases: 55, hours: 42, efficiency: 1.31 },
  ];

  const studentSuccess = [
    { name: "Fall 2023", transfer: 78, gpa: 2.7, completion: 82 },
    { name: "Spring 2024", transfer: 81, gpa: 2.8, completion: 85 },
    { name: "Fall 2024", transfer: 84, gpa: 2.9, completion: 88 },
    { name: "Spring 2025", transfer: 88, gpa: 3.0, completion: 91 },
  ];

  const correlationData = [
    { x: 78, y: 2.7, z: 45 },
    { x: 81, y: 2.8, z: 52 },
    { x: 84, y: 2.9, z: 48 },
    { x: 88, y: 3.0, z: 55 },
    { x: 91, y: 3.1, z: 60 },
    { x: 75, y: 2.6, z: 40 },
    { x: 82, y: 2.85, z: 50 },
    { x: 86, y: 2.95, z: 58 },
  ];

  const performanceMetrics = [
    {
      title: "Avg Processing Time",
      value: "1.4s",
      trend: "-39% from Week 17",
    },
    {
      title: "Target Accuracy",
      value: "97%",
      trend: "+9% improvement",
    },
    {
      title: "Throughput",
      value: "245/hr",
      trend: "+18% capacity",
    },
    {
      title: "Quality Score",
      value: "96%",
      trend: "+8% quality",
    },
  ];

  return NextResponse.json({
    systemPerformance,
    officerProductivity,
    studentSuccess,
    correlationData,
    performanceMetrics,
    timestamp: new Date().toISOString(),
  });
}

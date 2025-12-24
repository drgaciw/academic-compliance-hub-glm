import { NextResponse } from "next/server";

export async function GET() {
  const scenarios = [
    {
      id: 1,
      name: "Current Baseline",
      description: "No changes to current process",
      transferRate: 88,
      processingTime: 1.4,
      officerHours: 40,
      cost: 50000,
      satisfaction: 85,
    },
    {
      id: 2,
      name: "AI Enhancement",
      description: "Add AI-powered document analysis",
      transferRate: 92,
      processingTime: 0.8,
      officerHours: 30,
      cost: 75000,
      satisfaction: 90,
    },
    {
      id: 3,
      name: "Staff Expansion",
      description: "Hire 2 additional compliance officers",
      transferRate: 90,
      processingTime: 1.2,
      officerHours: 45,
      cost: 120000,
      satisfaction: 88,
    },
    {
      id: 4,
      name: "Process Optimization",
      description: "Streamline workflow with automation",
      transferRate: 91,
      processingTime: 1.0,
      officerHours: 35,
      cost: 40000,
      satisfaction: 87,
    },
    {
      id: 5,
      name: "Hybrid Approach",
      description: "Combine AI + Process Optimization",
      transferRate: 95,
      processingTime: 0.7,
      officerHours: 25,
      cost: 90000,
      satisfaction: 94,
    },
  ];

  const radarData = [
    { metric: "Transfer Rate", current: 88, ai: 92, hybrid: 95 },
    { metric: "Efficiency", current: 72, ai: 88, hybrid: 95 },
    { metric: "Satisfaction", current: 85, ai: 90, hybrid: 94 },
    { metric: "Cost Effectiveness", current: 90, ai: 75, hybrid: 80 },
    { metric: "Scalability", current: 70, ai: 90, hybrid: 95 },
  ];

  const recommendations = [
    {
      rank: 1,
      scenario: "Hybrid Approach",
      reason: "Best overall performance with reasonable cost",
      impact: "+7% transfer rate",
      priority: "High",
    },
    {
      rank: 2,
      scenario: "Process Optimization",
      reason: "Quick wins with minimal investment",
      impact: "+3% transfer rate",
      priority: "Medium",
    },
    {
      rank: 3,
      scenario: "AI Enhancement",
      reason: "Significant efficiency gains",
      impact: "+4% transfer rate",
      priority: "Medium",
    },
    {
      rank: 4,
      scenario: "Staff Expansion",
      reason: "Most expensive option",
      impact: "+2% transfer rate",
      priority: "Low",
    },
  ];

  return NextResponse.json({
    scenarios,
    radarData,
    recommendations,
    timestamp: new Date().toISOString(),
  });
}

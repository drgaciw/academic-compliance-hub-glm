import { NextResponse } from "next/server";

export async function GET() {
  const atRiskStudents = [
    {
      id: "STU-001",
      name: "John Smith",
      sport: "Football",
      department: "Business",
      gpa: 2.1,
      credits: 24,
      riskScore: 92,
      lastUpdate: "2 hours ago",
    },
    {
      id: "STU-002",
      name: "Sarah Johnson",
      sport: "Basketball",
      department: "Engineering",
      gpa: 2.3,
      credits: 18,
      riskScore: 88,
      lastUpdate: "4 hours ago",
    },
    {
      id: "STU-003",
      name: "Michael Brown",
      sport: "Track",
      department: "Arts",
      gpa: 2.4,
      credits: 30,
      riskScore: 85,
      lastUpdate: "1 day ago",
    },
    {
      id: "STU-004",
      name: "Emily Davis",
      sport: "Soccer",
      department: "Science",
      gpa: 2.5,
      credits: 21,
      riskScore: 82,
      lastUpdate: "5 hours ago",
    },
    {
      id: "STU-005",
      name: "David Wilson",
      sport: "Baseball",
      department: "Business",
      gpa: 2.6,
      credits: 27,
      riskScore: 78,
      lastUpdate: "3 hours ago",
    },
  ];

  const riskByDepartment = [
    { name: "Engineering", high: 12, medium: 25, low: 63 },
    { name: "Business", high: 8, medium: 20, low: 72 },
    { name: "Science", high: 6, medium: 18, low: 76 },
    { name: "Arts", high: 5, medium: 15, low: 80 },
    { name: "Education", high: 3, medium: 10, low: 87 },
  ];

  const riskBySport = [
    { name: "Football", riskScore: 72, students: 85 },
    { name: "Basketball", riskScore: 65, students: 65 },
    { name: "Baseball", riskScore: 58, students: 45 },
    { name: "Soccer", riskScore: 52, students: 55 },
    { name: "Track", riskScore: 48, students: 40 },
    { name: "Swimming", riskScore: 35, students: 30 },
  ];

  const interventionEffectiveness = [
    { week: "Week 17", intervention: 45, success: 65 },
    { week: "Week 18", intervention: 52, success: 72 },
    { week: "Week 19", intervention: 58, success: 78 },
    { week: "Week 20", intervention: 64, success: 84 },
    { week: "Week 21", intervention: 70, success: 88 },
    { week: "Week 22", intervention: 78, success: 92 },
  ];

  const heatMapData = [
    { name: "Football", Engineering: 85, Business: 75, Science: 70, Arts: 65 },
    {
      name: "Basketball",
      Engineering: 78,
      Business: 72,
      Science: 68,
      Arts: 62,
    },
    { name: "Baseball", Engineering: 65, Business: 60, Science: 58, Arts: 55 },
    { name: "Soccer", Engineering: 58, Business: 55, Science: 52, Arts: 48 },
    { name: "Track", Engineering: 52, Business: 48, Science: 45, Arts: 42 },
  ];

  const earlyWarningData = [
    { name: "GPA Decline", current: 23, threshold: 15, trend: "up" },
    { name: "Credit Shortage", current: 18, threshold: 20, trend: "down" },
    { name: "Course Failures", current: 12, threshold: 10, trend: "up" },
    { name: "Attendance Issues", current: 28, threshold: 25, trend: "up" },
  ];

  const riskMetrics = [
    {
      title: "At-Risk Students",
      value: "47",
      trend: "-12%",
      positive: true,
    },
    {
      title: "Interventions Active",
      value: "78",
      trend: "+18%",
      positive: true,
    },
    {
      title: "Success Rate",
      value: "92%",
      trend: "+27%",
      positive: true,
    },
    {
      title: "Avg Risk Score",
      value: "68",
      trend: "-8",
      positive: true,
    },
  ];

  return NextResponse.json({
    atRiskStudents,
    riskByDepartment,
    riskBySport,
    interventionEffectiveness,
    heatMapData,
    earlyWarningData,
    riskMetrics,
    timestamp: new Date().toISOString(),
  });
}

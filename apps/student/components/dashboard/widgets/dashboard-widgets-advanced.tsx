"use client";

import { useState, useEffect } from "react";
import { WidgetWrapper } from "../widget-wrapper";
import { useSSE, type SSEEvent } from "../../../hooks/use-sse";
import { GPAWidget } from "./gpa-widget";
import { GPAHistoryChart } from "./gpa-history-chart";
import { ComplianceWidget } from "./compliance-widget";
import { DeadlineIndicators, type Deadline } from "./deadline-indicators";
import {
  ComplianceTimeline,
  type ComplianceHistoryEntry,
} from "./compliance-timeline";
import { CircularProgress } from "./circular-progress";

export function DashboardWidgets() {
  const [gpaData, setGpaData] = useState({
    gpa: 3.45,
    trend: "up" as const,
    trendValue: 0.15,
  });

  const [complianceRequirements, setComplianceRequirements] = useState([
    {
      id: "1",
      name: "Core Course Requirements",
      status: "complete" as const,
      details: [
        "16 core courses completed",
        "English: 4 courses",
        "Math: 3 courses",
        "Natural/Physical Science: 2 courses",
        "Social Science: 2 courses",
      ],
    },
    {
      id: "2",
      name: "GPA Requirements",
      status: "complete" as const,
      details: [
        "Core course GPA: 2.300 minimum",
        "Your core GPA: 3.200",
        "Eligibility: ✓ Certified",
      ],
    },
    {
      id: "3",
      name: "Test Score Requirements",
      status: "in_progress" as const,
      details: [
        "SAT/ACT score submission pending",
        "Minimum combined score: 820 (SAT) or 68 (ACT)",
      ],
    },
    {
      id: "4",
      name: "Amateurism Certification",
      status: "pending" as const,
      details: [
        "Complete amateurism questionnaire",
        "Provide additional documentation if requested",
      ],
    },
  ]);

  const [deadlines] = useState<Deadline[]>([
    {
      id: "1",
      title: "Transcript Submission",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "critical",
      type: "document",
    },
    {
      id: "2",
      title: "Core Course Review",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "warning",
      type: "compliance",
    },
    {
      id: "3",
      title: "GPA Certification Deadline",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "pending",
      type: "academic",
    },
  ]);

  const [complianceHistory] = useState<ComplianceHistoryEntry[]>([
    {
      id: "1",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      action: "Core Course Requirement Certified",
      status: "complete",
      description: "All 16 core courses verified and certified",
      category: "Academic",
    },
    {
      id: "2",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      action: "GPA Review In Progress",
      status: "in_progress",
      description: "Your core GPA of 3.200 is being reviewed",
      category: "Academic",
    },
    {
      id: "3",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      action: "Test Score Upload Failed",
      status: "failed",
      description: "File format not supported. Please submit PDF or JPEG.",
      category: "Document",
    },
    {
      id: "4",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      action: "Amateurism Questionnaire Initiated",
      status: "in_progress",
      description: "Please complete the amateurism certification",
      category: "Compliance",
    },
  ]);

  const [gpaHistory, setGpaHistory] = useState([
    { semester: "Fall 2022", gpa: 3.1, targetGpa: 2.3 },
    { semester: "Spring 2023", gpa: 3.25, targetGpa: 2.3 },
    { semester: "Fall 2023", gpa: 3.35, targetGpa: 2.3 },
    { semester: "Spring 2024", gpa: 3.45, targetGpa: 2.3 },
  ]);

  const { isConnected, lastEvent } = useSSE({
    url: "/api/realtime",
    enabled: true,
    onMessage: (event: SSEEvent) => {
      console.log("[Dashboard] SSE Event:", event);

      if (event.type === "gpa_update") {
        const data = event.data as any;
        setGpaData({
          gpa: data.gpa,
          trend: data.trend,
          trendValue: data.trendValue,
        });

        setGpaHistory((prev) =>
          [
            ...prev,
            {
              semester: "Current",
              gpa: data.gpa,
              targetGpa: 2.3,
            },
          ].slice(-4),
        );
      }

      if (event.type === "compliance_update") {
        const data = event.data as any;
        setComplianceRequirements((prev) =>
          prev.map((req) =>
            req.name === data.requirement
              ? { ...req, status: data.status }
              : req,
          ),
        );
      }
    },
    onError: (error) => {
      console.error("[Dashboard] SSE Error:", error);
    },
  });

  return (
    <>
      <WidgetWrapper title="Academic Progress">
        {isConnected && (
          <div className="mb-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600">Live Updates</span>
          </div>
        )}
        <GPAWidget {...gpaData} />
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            GPA History
          </h4>
          <GPAHistoryChart data={gpaHistory} />
        </div>
      </WidgetWrapper>

      <WidgetWrapper title="Completion Rate">
        <CircularProgress value={85} />
      </WidgetWrapper>

      <WidgetWrapper title="Compliance Status">
        <ComplianceWidget requirements={complianceRequirements} />
      </WidgetWrapper>

      <WidgetWrapper title="Upcoming Deadlines">
        <DeadlineIndicators deadlines={deadlines} />
      </WidgetWrapper>

      <WidgetWrapper title="Compliance History">
        <ComplianceTimeline entries={complianceHistory} />
      </WidgetWrapper>
    </>
  );
}

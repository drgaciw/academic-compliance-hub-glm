"use client";

import { WidgetWrapper } from "../widget-wrapper";
import { GPAWidget } from "./gpa-widget";
import { CircularProgress } from "./circular-progress";
import { ComplianceWidget } from "./compliance-widget";

export function DashboardWidgets() {
  const gpaData = {
    gpa: 3.45,
    trend: "up" as const,
    trendValue: 0.15,
  };

  const complianceRequirements = [
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
  ];

  return (
    <>
      <WidgetWrapper title="Academic Progress">
        <GPAWidget {...gpaData} />
      </WidgetWrapper>

      <WidgetWrapper title="Completion Rate">
        <CircularProgress value={85} />
      </WidgetWrapper>

      <WidgetWrapper title="Compliance Status">
        <ComplianceWidget requirements={complianceRequirements} />
      </WidgetWrapper>
    </>
  );
}

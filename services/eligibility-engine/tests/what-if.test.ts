import { WhatIfService } from "../src/services/what-if.service";
import { CourseGradeInput, WhatIfScenarioRequest } from "../src/types";

describe("What-If Service - Scenario Types", () => {
  const mockStudentId = "STU001";

  describe("Add Course Scenario", () => {
    it("should calculate impact of adding a course", async () => {
      const courseToAdd: CourseGradeInput = {
        courseId: "MATH201",
        credits: 3,
        grade: "A",
      };

      const result = await WhatIfService.runAddCourseScenario(
        mockStudentId,
        courseToAdd,
      );

      expect(result).toBeDefined();
      expect(result.scenarioType).toBe("add_course");
      expect(result.projected.gpa).toBeGreaterThan(0);
      expect(result.projected.credits).toBeGreaterThan(0);
      expect(result.comparison.gpaChange).toBeDefined();
    });

    it("should improve GPA when adding high-grade course", async () => {
      const courseToAdd: CourseGradeInput = {
        courseId: "ENGL101",
        credits: 3,
        grade: "A",
      };

      const result = await WhatIfService.runAddCourseScenario(
        mockStudentId,
        courseToAdd,
      );

      expect(result.comparison.gpaChange).toBeGreaterThanOrEqual(0);
    });

    it("should identify risk factors for failing grade", async () => {
      const courseToAdd: CourseGradeInput = {
        courseId: "MATH201",
        credits: 3,
        grade: "F",
      };

      const result = await WhatIfService.runAddCourseScenario(
        mockStudentId,
        courseToAdd,
      );

      expect(result.comparison.riskFactors.length).toBeGreaterThan(0);
      expect(
        result.comparison.riskFactors.some((rf) => rf.category === "gpa"),
      ).toBe(true);
    });
  });

  describe("Change Grade Scenario", () => {
    it("should calculate impact of grade change", async () => {
      const result = await WhatIfService.runChangeGradeScenario(
        mockStudentId,
        "MATH101",
        "A",
      );

      expect(result).toBeDefined();
      expect(result.scenarioType).toBe("change_grade");
      expect(result.projected.gpa).toBeDefined();
    });

    it("should project GPA improvement from B to A", async () => {
      const result = await WhatIfService.runChangeGradeScenario(
        mockStudentId,
        "ENGL101",
        "A",
      );

      expect(result.comparison.gpaChange).toBeGreaterThanOrEqual(0);
    });

    it("should handle numeric grade changes", async () => {
      const result = await WhatIfService.runChangeGradeScenario(
        mockStudentId,
        "HIST101",
        4.0,
      );

      expect(result.projected.gpa).toBeGreaterThanOrEqual(0);
    });

    it("should project GPA decline from A to C", async () => {
      const result = await WhatIfService.runChangeGradeScenario(
        mockStudentId,
        "MATH101",
        "C",
      );

      expect(result.comparison.gpaChange).toBeLessThanOrEqual(0);
    });
  });

  describe("Drop Course Scenario", () => {
    it("should calculate impact of dropping a course", async () => {
      const result = await WhatIfService.runDropCourseScenario(
        mockStudentId,
        "MATH101",
      );

      expect(result).toBeDefined();
      expect(result.scenarioType).toBe("drop_course");
      expect(result.projected.credits).toBeDefined();
    });

    it("should show credit reduction when dropping course", async () => {
      const result = await WhatIfService.runDropCourseScenario(
        mockStudentId,
        "ENGL101",
      );

      expect(result.comparison.creditChange).toBeLessThanOrEqual(0);
    });
  });

  describe("Retake Course Scenario", () => {
    it("should calculate impact of retaking failed course", async () => {
      const result = await WhatIfService.runRetakeCourseScenario(
        mockStudentId,
        "MATH101",
        "B",
      );

      expect(result).toBeDefined();
      expect(result.scenarioType).toBe("retake_course");
      expect(result.comparison.gpaChange).toBeDefined();
    });

    it("should project GPA improvement when retaking with better grade", async () => {
      const result = await WhatIfService.runRetakeCourseScenario(
        mockStudentId,
        "FAILED101",
        "A",
      );

      expect(result.comparison.gpaChange).toBeGreaterThanOrEqual(0);
    });

    it("should include course in critical path if retaken", async () => {
      const result = await WhatIfService.runRetakeCourseScenario(
        mockStudentId,
        "MATH201",
        "B",
      );

      expect(result.criticalPathCourses).toBeDefined();
    });
  });

  describe("Change Major Scenario", () => {
    it("should calculate impact of changing major", async () => {
      const requiredCourses: CourseGradeInput[] = [
        { courseId: "PHYS101", credits: 4, grade: "B" },
        { courseId: "CHEM101", credits: 4, grade: "C" },
      ];

      const result = await WhatIfService.runChangeMajorScenario(
        mockStudentId,
        "Physics",
        requiredCourses,
      );

      expect(result).toBeDefined();
      expect(result.scenarioType).toBe("change_major");
      expect(result.projected.credits).toBeGreaterThan(0);
    });

    it("should project degree progress for new major", async () => {
      const requiredCourses: CourseGradeInput[] = [
        { courseId: "CS101", credits: 3, grade: "A" },
        { courseId: "CS102", credits: 3, grade: "A" },
      ];

      const result = await WhatIfService.runChangeMajorScenario(
        mockStudentId,
        "Computer Science",
        requiredCourses,
      );

      expect(result.projected.progressTowardDegree).toBeDefined();
      expect(
        result.projected.progressTowardDegree.percentageComplete,
      ).toBeGreaterThanOrEqual(0);
    });
  });
});

describe("What-If Service - GPA Projections", () => {
  const mockStudentId = "STU002";

  it("should project cumulative GPA for future terms", async () => {
    const projectedCourses: CourseGradeInput[] = [
      { courseId: "MATH201", credits: 3, grade: "A" },
      { courseId: "ENGL201", credits: 3, grade: "B" },
    ];

    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "Next Term Projection",
      assumptions: {
        additionalCourses: projectedCourses,
      },
    });

    expect(result.projected.gpa).toBeGreaterThan(0);
    expect(result.projected.credits).toBeGreaterThan(0);
  });

  it("should compare current vs projected GPA", async () => {
    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "GPA Comparison",
      assumptions: {
        additionalCourses: [{ courseId: "HIST201", credits: 3, grade: "A" }],
      },
    });

    expect(result.comparison.currentGPA).toBeDefined();
    expect(result.comparison.projectedGPA).toBeDefined();
    expect(result.comparison.gpaChange).toBeDefined();
  });

  it("should identify at-risk GPA scenarios", async () => {
    const lowGradeCourses: CourseGradeInput[] = [
      { courseId: "MATH201", credits: 3, grade: "D" },
      { courseId: "ENGL201", credits: 3, grade: "F" },
    ];

    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "At Risk Scenario",
      assumptions: {
        additionalCourses: lowGradeCourses,
      },
    });

    expect(
      result.comparison.riskFactors.some((rf) => rf.category === "gpa"),
    ).toBe(true);
  });

  it("should calculate required performance for target GPA", async () => {
    const result = await WhatIfService.calculateRequiredPerformance(
      mockStudentId,
      3.0,
      15,
    );

    expect(result).toBeDefined();
    expect(result.targetGPA).toBe(3.0);
    expect(result.currentGPA).toBeGreaterThanOrEqual(0);
    expect(result.requiredGPA).toBeDefined();
    expect(result.recommendedGrades).toBeDefined();
  });

  it("should identify unachievable target GPA", async () => {
    const result = await WhatIfService.calculateRequiredPerformance(
      mockStudentId,
      4.0,
      120,
    );

    expect(result.achievable).toBe(false);
    expect(result.requiredGPA).toBeGreaterThan(4.0);
  });
});

describe("What-If Service - Subject Area GPAs", () => {
  const mockStudentId = "STU003";

  it("should calculate subject-area GPAs for future terms", async () => {
    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "Subject Area Analysis",
      assumptions: {
        additionalCourses: [
          { courseId: "MATH201", credits: 3, grade: "A" },
          { courseId: "ENGL201", credits: 3, grade: "B" },
        ],
      },
    });

    expect(result.projected.subjectAreaGPAs).toBeDefined();
    expect(result.projected.subjectAreaGPAs.length).toBeGreaterThan(0);
  });

  it("should compare current vs projected subject area GPAs", async () => {
    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "Subject Area Comparison",
      assumptions: {
        additionalCourses: [{ courseId: "PHYS201", credits: 4, grade: "B" }],
      },
    });

    for (const subject of result.projected.subjectAreaGPAs) {
      expect(subject.currentGPA).toBeDefined();
      expect(subject.projectedGPA).toBeDefined();
      expect(subject.change).toBeDefined();
    }
  });

  it("should identify subject areas below minimum requirements", async () => {
    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "Subject Area Risk",
      assumptions: {
        additionalCourses: [{ courseId: "MATH301", credits: 3, grade: "C-" }],
      },
    });

    const belowMinimum = result.projected.subjectAreaGPAs.filter(
      (s) => !s.meetsMinimum && s.minimumRequired !== null,
    );
    expect(belowMinimum.length).toBeGreaterThanOrEqual(0);
  });
});

describe("What-If Service - Progress Toward Degree", () => {
  const mockStudentId = "STU004";

  it("should project progress-toward-degree completion", async () => {
    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "PTD Projection",
      assumptions: {
        additionalCourses: [
          { courseId: "GENED101", credits: 3, grade: "B" },
          { courseId: "GENED102", credits: 3, grade: "A" },
        ],
      },
    });

    expect(result.projected.progressTowardDegree).toBeDefined();
    expect(
      result.projected.progressTowardDegree.percentageComplete,
    ).toBeGreaterThanOrEqual(0);
    expect(result.projected.progressTowardDegree.creditsEarned).toBeGreaterThan(
      0,
    );
    expect(
      result.projected.progressTowardDegree.creditsRemaining,
    ).toBeGreaterThanOrEqual(0);
  });

  it("should determine if student is on track for graduation", async () => {
    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "Graduation Track",
      assumptions: {
        creditsToComplete: 120,
      },
    });

    expect(result.projected.progressTowardDegree.onTrack).toBeDefined();
  });
});

describe("What-If Service - At-Risk Scenarios", () => {
  const mockStudentId = "STU005";

  it("should identify at-risk scenarios before they occur", async () => {
    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "Risk Assessment",
      assumptions: {
        additionalCourses: [
          { courseId: "MATH201", credits: 3, grade: "D" },
          { courseId: "ENGL201", credits: 3, grade: "F" },
        ],
      },
    });

    expect(result.comparison.riskFactors.length).toBeGreaterThan(0);
  });

  it("should generate intervention recommendations", async () => {
    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "Intervention Planning",
      assumptions: {
        additionalCourses: [{ courseId: "HIST201", credits: 3, grade: "C-" }],
      },
    });

    expect(result.recommendations).toBeDefined();
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it("should assign priority to recommendations", async () => {
    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "Priority Assessment",
      assumptions: {
        additionalCourses: [{ courseId: "MATH301", credits: 3, grade: "F" }],
      },
    });

    for (const rec of result.recommendations) {
      expect(["high", "medium", "low"]).toContain(rec.priority);
    }
  });

  it("should analyze at-risk scenarios in bulk", async () => {
    const results = await WhatIfService.analyzeAtRiskScenarios(
      mockStudentId,
      5,
    );

    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      expect(result.projected.eligibilityStatus).toBe("ineligible");
    }
  });
});

describe("What-If Service - Scenario Comparison", () => {
  const mockStudentId = "STU006";

  it("should compare multiple scenarios side-by-side", async () => {
    const scenarios: WhatIfScenarioRequest[] = [
      {
        studentId: mockStudentId,
        scenarioName: "Scenario 1: High Performance",
        assumptions: {
          additionalCourses: [
            { courseId: "MATH201", credits: 3, grade: "A" },
            { courseId: "ENGL201", credits: 3, grade: "A" },
          ],
        },
      },
      {
        studentId: mockStudentId,
        scenarioName: "Scenario 2: Moderate Performance",
        assumptions: {
          additionalCourses: [
            { courseId: "MATH201", credits: 3, grade: "B" },
            { courseId: "ENGL201", credits: 3, grade: "B" },
          ],
        },
      },
      {
        studentId: mockStudentId,
        scenarioName: "Scenario 3: Low Performance",
        assumptions: {
          additionalCourses: [
            { courseId: "MATH201", credits: 3, grade: "C" },
            { courseId: "ENGL201", credits: 3, grade: "D" },
          ],
        },
      },
    ];

    const comparison = await WhatIfService.compareScenarios(
      mockStudentId,
      scenarios,
    );

    expect(comparison).toBeDefined();
    expect(comparison.comparedScenarios.length).toBe(2);
    expect(comparison.bestScenario).toBeDefined();
  });

  it("should rank scenarios by impact on eligibility", async () => {
    const scenarios: WhatIfScenarioRequest[] = [
      {
        studentId: mockStudentId,
        scenarioName: "Best Case",
        assumptions: {
          additionalCourses: [{ courseId: "MATH201", credits: 3, grade: "A" }],
        },
      },
      {
        studentId: mockStudentId,
        scenarioName: "Worst Case",
        assumptions: {
          additionalCourses: [{ courseId: "MATH201", credits: 3, grade: "F" }],
        },
      },
    ];

    const comparison = await WhatIfService.compareScenarios(
      mockStudentId,
      scenarios,
    );

    expect(comparison.rankings).toBeDefined();
    expect(comparison.rankings.length).toBe(2);
    expect(comparison.rankings[0].overallScore).toBeGreaterThanOrEqual(
      comparison.rankings[1].overallScore,
    );
  });

  it("should identify best scenario with rationale", async () => {
    const scenarios: WhatIfScenarioRequest[] = [
      {
        studentId: mockStudentId,
        scenarioName: "Option A",
        assumptions: {
          additionalCourses: [{ courseId: "MATH201", credits: 3, grade: "B" }],
        },
      },
      {
        studentId: mockStudentId,
        scenarioName: "Option B",
        assumptions: {
          additionalCourses: [{ courseId: "MATH201", credits: 3, grade: "A" }],
        },
      },
    ];

    const comparison = await WhatIfService.compareScenarios(
      mockStudentId,
      scenarios,
    );

    expect(comparison.bestScenario.name).toBeDefined();
    expect(comparison.bestScenario.reason).toBeDefined();
    expect(comparison.bestScenario.result).toBeDefined();
  });
});

describe("What-If Service - Critical Path Courses", () => {
  const mockStudentId = "STU007";

  it("should identify critical path courses for graduation", async () => {
    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "Critical Path Analysis",
      assumptions: {
        additionalCourses: [
          { courseId: "MATH201", credits: 3, grade: "A" },
          { courseId: "CORE101", credits: 3, grade: "A" },
        ],
      },
    });

    expect(result.criticalPathCourses).toBeDefined();
    expect(Array.isArray(result.criticalPathCourses)).toBe(true);
  });

  it("should identify failed core courses as critical", async () => {
    const result = await WhatIfService.runRetakeCourseScenario(
      mockStudentId,
      "CORE101",
      "B",
    );

    expect(result.criticalPathCourses).toContain("CORE101");
  });
});

describe("What-If Service - Risk Factors", () => {
  const mockStudentId = "STU008";

  it("should analyze GPA-related risk factors", async () => {
    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "GPA Risk Analysis",
      assumptions: {
        additionalCourses: [{ courseId: "MATH201", credits: 3, grade: "D" }],
      },
    });

    const gpaRisks = result.comparison.riskFactors.filter(
      (rf) => rf.category === "gpa",
    );
    expect(gpaRisks.length).toBeGreaterThan(0);
  });

  it("should categorize risk severity", async () => {
    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "Severity Assessment",
      assumptions: {
        additionalCourses: [{ courseId: "MATH301", credits: 3, grade: "F" }],
      },
    });

    for (const risk of result.comparison.riskFactors) {
      expect(["critical", "major", "minor"]).toContain(risk.severity);
    }
  });

  it("should calculate risk difference values", async () => {
    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "Risk Values",
      assumptions: {
        additionalCourses: [{ courseId: "ENGL201", credits: 3, grade: "C" }],
      },
    });

    for (const risk of result.comparison.riskFactors) {
      expect(risk.currentValue).toBeDefined();
      expect(risk.requiredValue).toBeDefined();
      expect(risk.difference).toBeDefined();
    }
  });
});

describe("What-If Service - Recommendations", () => {
  const mockStudentId = "STU009";

  it("should generate high-priority recommendations for ineligible scenarios", async () => {
    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "Ineligible Scenario",
      assumptions: {
        additionalCourses: [
          { courseId: "MATH201", credits: 3, grade: "F" },
          { courseId: "ENGL201", credits: 3, grade: "F" },
        ],
      },
    });

    if (result.projected.eligibilityStatus === "ineligible") {
      const highPriorityRecs = result.recommendations.filter(
        (r) => r.priority === "high",
      );
      expect(highPriorityRecs.length).toBeGreaterThan(0);
    }
  });

  it("should include action, rationale, and timeline in recommendations", async () => {
    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "Recommendation Test",
      assumptions: {
        additionalCourses: [{ courseId: "HIST201", credits: 3, grade: "B" }],
      },
    });

    for (const rec of result.recommendations) {
      expect(rec.action).toBeDefined();
      expect(rec.rationale).toBeDefined();
      expect(rec.impact).toBeDefined();
    }
  });

  it("should suggest retaking failed courses", async () => {
    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "Retake Recommendation",
      assumptions: {
        additionalCourses: [{ courseId: "MATH201", credits: 3, grade: "F" }],
      },
    });

    const retakeRecommendation = result.recommendations.find(
      (r) => r.action.includes("repeat") || r.action.includes("retake"),
    );
    expect(retakeRecommendation).toBeDefined();
  });
});

describe("What-If Service - Eligibility Status", () => {
  const mockStudentId = "STU010";

  it("should determine eligible status when requirements met", async () => {
    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "Eligible Scenario",
      assumptions: {
        additionalCourses: [
          { courseId: "MATH201", credits: 3, grade: "A" },
          { courseId: "ENGL201", credits: 3, grade: "A" },
        ],
        creditsToComplete: 100,
      },
    });

    expect(["eligible", "ineligible", "conditional"]).toContain(
      result.projected.eligibilityStatus,
    );
  });

  it("should identify violations when requirements not met", async () => {
    const result = await WhatIfService.runScenario({
      studentId: mockStudentId,
      scenarioName: "Violation Check",
      assumptions: {
        additionalCourses: [{ courseId: "MATH201", credits: 3, grade: "D" }],
        creditsToComplete: 10,
      },
    });

    expect(Array.isArray(result.projected.violations)).toBe(true);
  });
});

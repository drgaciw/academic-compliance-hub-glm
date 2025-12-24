import {
  WaiverDetectionEngine,
  WaiverDocumentationGenerator,
} from "../src/services/detection/index.js";
import type { StudentRecord, EligibilityResult } from "../src/types/index.js";

describe("WaiverDetectionEngine", () => {
  let engine: WaiverDetectionEngine;

  beforeEach(() => {
    engine = new WaiverDetectionEngine();
  });

  describe("detectWaivers", () => {
    it("should detect GPA requirement waiver for medical hardship", () => {
      const studentRecord: StudentRecord = {
        studentId: "STU001",
        name: "John Doe",
        gpa: 1.8,
        completedCredits: 24,
        currentCredits: 0,
        academicYear: 2,
        academicStanding: "probation",
        cumulativeGPA: 1.8,
      };

      const violation: EligibilityResult = {
        passed: false,
        ruleId: "gpa-requirements",
        ruleName: "GPA Requirements",
        bylawReference: "14.3.1",
        message: "GPA below required threshold",
        details: {
          currentValue: 1.8,
          requiredValue: 2.0,
          difference: -0.2,
        },
        remediation: ["Complete additional courses", "Improve grades"],
      };

      const results = engine.detectWaivers(studentRecord, [violation]);

      expect(results).toHaveLength(1);
      expect(results[0].requiresWaiver).toBe(true);
      expect(results[0].waiverType).toBe("GPA_REQUIREMENTS");
      expect(results[0].scenario).not.toBeNull();
      expect(results[0].suggestedWaiver).not.toBeNull();
    });

    it("should detect progress toward degree waiver for natural disaster", () => {
      const studentRecord: StudentRecord = {
        studentId: "STU002",
        name: "Jane Smith",
        gpa: 2.5,
        completedCredits: 0,
        currentCredits: 0,
        academicYear: 1,
        academicStanding: "warning",
        cumulativeGPA: 2.5,
      };

      const violation: EligibilityResult = {
        passed: false,
        ruleId: "ptd-requirements",
        ruleName: "Progress Toward Degree",
        bylawReference: "14.4.1",
        message: "Insufficient progress toward degree",
        details: {
          currentValue: 0,
          requiredValue: 24,
          difference: -24,
        },
        remediation: ["Complete degree requirements"],
      };

      const results = engine.detectWaivers(studentRecord, [violation]);

      expect(results).toHaveLength(1);
      expect(results[0].waiverType).toBe("PROGRESS_TOWARD_DEGREE");
      expect(results[0].scenario).toBe("NATURAL_DISASTER");
    });

    it("should detect learning disability waiver with appropriate scenario", () => {
      const studentRecord: StudentRecord = {
        studentId: "STU003",
        name: "Bob Johnson",
        gpa: 1.9,
        completedCredits: 30,
        currentCredits: 12,
        academicYear: 2,
        academicStanding: "warning",
        cumulativeGPA: 1.9,
      };

      const violation: EligibilityResult = {
        passed: false,
        ruleId: "gpa-requirements",
        ruleName: "GPA Requirements",
        bylawReference: "14.3.1",
        message: "GPA below required threshold",
        details: {
          currentValue: 1.9,
          requiredValue: 2.0,
          difference: -0.1,
        },
        remediation: ["Improve grades"],
      };

      const results = engine.detectWaivers(studentRecord, [violation]);

      expect(results).toHaveLength(1);
      expect(results[0].scenario).toBe("LEARNING_DISABILITY");
      expect(results[0].suggestedWaiver?.requiredDocuments).toContain(
        "PSYCHOEDUCATIONAL_EVALUATION",
      );
    });

    it("should not suggest waiver when all requirements met", () => {
      const studentRecord: StudentRecord = {
        studentId: "STU004",
        name: "Alice Williams",
        gpa: 3.5,
        completedCredits: 60,
        currentCredits: 15,
        academicYear: 3,
        academicStanding: "good",
        cumulativeGPA: 3.5,
      };

      const results = engine.detectWaivers(studentRecord, []);

      expect(results).toHaveLength(0);
    });

    it("should handle multiple violations and suggest appropriate waivers", () => {
      const studentRecord: StudentRecord = {
        studentId: "STU005",
        name: "Charlie Brown",
        gpa: 1.7,
        completedCredits: 20,
        currentCredits: 0,
        academicYear: 2,
        academicStanding: "probation",
        cumulativeGPA: 1.7,
      };

      const violations: EligibilityResult[] = [
        {
          passed: false,
          ruleId: "gpa-requirements",
          ruleName: "GPA Requirements",
          bylawReference: "14.3.1",
          message: "GPA below required threshold",
          details: {
            currentValue: 1.7,
            requiredValue: 2.0,
            difference: -0.3,
          },
        },
        {
          passed: false,
          ruleId: "credit-hours",
          ruleName: "Credit Hour Requirements",
          bylawReference: "14.2.1",
          message: "Insufficient credit hours",
          details: {
            currentValue: 20,
            requiredValue: 24,
            difference: -4,
          },
        },
      ];

      const results = engine.detectWaivers(studentRecord, violations);

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.requiresWaiver)).toBe(true);
    });
  });

  describe("getScenarioDetails", () => {
    it("should return medical hardship scenario details", () => {
      const scenario = engine.getScenarioDetails("MEDICAL_HARDSHIP");

      expect(scenario).toBeDefined();
      expect(scenario?.type).toBe("MEDICAL_HARDSHIP");
      expect(scenario?.requiredDocuments).toContain("MEDICAL_CERTIFICATION");
      expect(scenario?.requiredDocuments).toContain("PHYSICIAN_STATEMENT");
    });

    it("should return military service scenario details", () => {
      const scenario = engine.getScenarioDetails("MILITARY_SERVICE");

      expect(scenario).toBeDefined();
      expect(scenario?.type).toBe("MILITARY_SERVICE");
      expect(scenario?.requiredDocuments).toContain("MILITARY_ORDERS");
      expect(scenario?.requiredDocuments).toContain("DD214_DISCHARGE_PAPERS");
    });

    it("should return learning disability scenario details", () => {
      const scenario = engine.getScenarioDetails("LEARNING_DISABILITY");

      expect(scenario).toBeDefined();
      expect(scenario?.requiredDocuments).toContain(
        "PSYCHOEDUCATIONAL_EVALUATION",
      );
      expect(scenario?.requiredDocuments).toContain("IEP_DOCUMENTATION");
    });

    it("should return undefined for unknown scenario", () => {
      const scenario = engine.getScenarioDetails("UNKNOWN_SCENARIO" as any);

      expect(scenario).toBeUndefined();
    });
  });

  describe("getAllScenarios", () => {
    it("should return all defined scenarios", () => {
      const scenarios = engine.getAllScenarios();

      expect(scenarios).toHaveLength(8);
      const scenarioTypes = scenarios.map((s) => s.type);
      expect(scenarioTypes).toContain("MEDICAL_HARDSHIP");
      expect(scenarioTypes).toContain("MILITARY_SERVICE");
      expect(scenarioTypes).toContain("RELIGIOUS_ACCOMMODATION");
      expect(scenarioTypes).toContain("LEARNING_DISABILITY");
      expect(scenarioTypes).toContain("NATURAL_DISASTER");
      expect(scenarioTypes).toContain("NCAA_EXTENUATING_CIRCUMSTANCES");
      expect(scenarioTypes).toContain("FAMILY_EMERGENCY");
      expect(scenarioTypes).toContain("FINANCIAL_HARDSHIP");
    });
  });
});

describe("WaiverDocumentationGenerator", () => {
  let generator: WaiverDocumentationGenerator;

  beforeEach(() => {
    generator = new WaiverDocumentationGenerator();
  });

  describe("getRequiredDocuments", () => {
    it("should return medical hardship documents for medical scenario", () => {
      const docs = generator.getRequiredDocuments(
        "GPA_REQUIREMENTS",
        "MEDICAL_HARDSHIP",
      );

      expect(docs).toContain("MEDICAL_CERTIFICATION");
      expect(docs).toContain("PHYSICIAN_STATEMENT");
      expect(docs).toContain("MEDICAL_RECORDS");
      expect(docs).toContain("TREATMENT_TIMELINE");
    });

    it("should return military service documents for military scenario", () => {
      const docs = generator.getRequiredDocuments(
        "PROGRESS_TOWARD_DEGREE",
        "MILITARY_SERVICE",
      );

      expect(docs).toContain("MILITARY_ORDERS");
      expect(docs).toContain("DD214_DISCHARGE_PAPERS");
      expect(docs).toContain("SERVICE_RECORD");
      expect(docs).toContain("DEPLOYMENT_DOCUMENTATION");
    });

    it("should return learning disability documents for disability scenario", () => {
      const docs = generator.getRequiredDocuments(
        "GPA_REQUIREMENTS",
        "LEARNING_DISABILITY",
      );

      expect(docs).toContain("PSYCHOEDUCATIONAL_EVALUATION");
      expect(docs).toContain("IEP_DOCUMENTATION");
      expect(docs).toContain("SECTION_504_PLAN");
      expect(docs).toContain("DIAGNOSTIC_REPORT");
    });

    it("should return default documents for unknown scenario", () => {
      const docs = generator.getRequiredDocuments(
        "GPA_REQUIREMENTS",
        "UNKNOWN_SCENARIO" as any,
      );

      expect(docs).toContain("AFFIDAVIT");
      expect(docs).toContain("SUPPORTING_DOCUMENTATION");
    });
  });

  describe("getDocumentDescription", () => {
    it("should return description for medical certification", () => {
      const description = generator.getDocumentDescription(
        "MEDICAL_CERTIFICATION",
      );

      expect(description).toBe(
        "Official medical certification from licensed physician",
      );
    });

    it("should return description for military orders", () => {
      const description = generator.getDocumentDescription("MILITARY_ORDERS");

      expect(description).toBe(
        "Copy of military orders showing deployment dates",
      );
    });

    it("should return default description for unknown document", () => {
      const description = generator.getDocumentDescription("UNKNOWN_DOC");

      expect(description).toBe("Required documentation");
    });
  });

  describe("getExpirationPolicy", () => {
    it("should return expiration policy for medical certification in medical hardship", () => {
      const policy = generator.getExpirationPolicy(
        "MEDICAL_CERTIFICATION",
        "MEDICAL_HARDSHIP",
      );

      expect(policy).toBe("6 months from submission");
    });

    it("should return default expiration policy for medical certification", () => {
      const policy = generator.getExpirationPolicy(
        "MEDICAL_CERTIFICATION",
        "GPA_REQUIREMENTS",
      );

      expect(policy).toBe("1 year from date of issue");
    });

    it("should return expiration policy for psychoeducational evaluation", () => {
      const policy = generator.getExpirationPolicy(
        "PSYCHOEDUCATIONAL_EVALUATION",
        "LEARNING_DISABILITY",
      );

      expect(policy).toBe("5 years from date of evaluation");
    });

    it("should return undefined for document without expiration policy", () => {
      const policy = generator.getExpirationPolicy(
        "UNKNOWN_DOC",
        "MEDICAL_HARDSHIP",
      );

      expect(policy).toBeUndefined();
    });
  });
});

describe("Waiver Detection Integration", () => {
  describe("success rate calculation", () => {
    it("should calculate high success rate for military service", () => {
      const studentRecord: StudentRecord = {
        studentId: "STU001",
        name: "Test Student",
        gpa: 2.0,
        completedCredits: 0,
        currentCredits: 0,
        academicYear: 2,
        academicStanding: "suspension",
        cumulativeGPA: 2.0,
      };

      const violation: EligibilityResult = {
        passed: false,
        ruleId: "ptd-requirements",
        ruleName: "Progress Toward Degree",
        bylawReference: "14.4.1",
        message: "No progress due to military service",
        details: {
          currentValue: 0,
          requiredValue: 24,
          difference: -24,
        },
      };

      const engine = new WaiverDetectionEngine();
      const results = engine.detectWaivers(studentRecord, [violation]);

      expect(results[0].suggestedWaiver?.estimatedSuccessRate).toBeGreaterThan(
        0.85,
      );
    });

    it("should calculate moderate success rate for financial hardship", () => {
      const studentRecord: StudentRecord = {
        studentId: "STU001",
        name: "Test Student",
        gpa: 2.0,
        completedCredits: 10,
        currentCredits: 0,
        academicYear: 1,
        academicStanding: "good",
        cumulativeGPA: 2.0,
      };

      const violation: EligibilityResult = {
        passed: false,
        ruleId: "credit-hours",
        ruleName: "Credit Hour Requirements",
        bylawReference: "14.2.1",
        message: "Insufficient credit hours",
        details: {
          currentValue: 10,
          requiredValue: 12,
          difference: -2,
        },
      };

      const engine = new WaiverDetectionEngine();
      const results = engine.detectWaivers(studentRecord, [violation]);

      expect(results[0].suggestedWaiver?.estimatedSuccessRate).toBeGreaterThan(
        0.8,
      );
    });
  });

  describe("justification generation", () => {
    it("should generate comprehensive justification for waiver", () => {
      const studentRecord: StudentRecord = {
        studentId: "STU001",
        name: "Test Student",
        gpa: 1.8,
        completedCredits: 24,
        currentCredits: 0,
        academicYear: 2,
        academicStanding: "probation",
        cumulativeGPA: 1.8,
      };

      const violation: EligibilityResult = {
        passed: false,
        ruleId: "gpa-requirements",
        ruleName: "GPA Requirements",
        bylawReference: "14.3.1",
        message: "GPA below required threshold",
        details: {
          currentValue: 1.8,
          requiredValue: 2.0,
          difference: -0.2,
        },
      };

      const engine = new WaiverDetectionEngine();
      const results = engine.detectWaivers(studentRecord, [violation]);

      expect(results[0].justification).toContain("GPA Requirements");
      expect(results[0].justification).toContain("14.3.1");
      expect(results[0].justification).toContain("Current value: 1.8");
      expect(results[0].justification).toContain("Required: 2");
      expect(results[0].justification).toContain("Required documentation");
    });
  });

  describe("recommended approach", () => {
    it("should provide appropriate approach for GPA waiver", () => {
      const engine = new WaiverDetectionEngine();

      const studentRecord: StudentRecord = {
        studentId: "STU001",
        name: "Test Student",
        gpa: 1.8,
        completedCredits: 24,
        currentCredits: 0,
        academicYear: 2,
        academicStanding: "probation",
        cumulativeGPA: 1.8,
      };

      const violation: EligibilityResult = {
        passed: false,
        ruleId: "gpa-requirements",
        ruleName: "GPA Requirements",
        bylawReference: "14.3.1",
        message: "GPA below required threshold",
        details: {
          currentValue: 1.8,
          requiredValue: 2.0,
          difference: -0.2,
        },
      };

      const results = engine.detectWaivers(studentRecord, [violation]);

      expect(results[0].suggestedWaiver?.recommendedApproach).toContain(
        "GPA waiver",
      );
    });

    it("should provide appropriate approach for PTD waiver", () => {
      const engine = new WaiverDetectionEngine();

      const studentRecord: StudentRecord = {
        studentId: "STU001",
        name: "Test Student",
        gpa: 2.5,
        completedCredits: 0,
        currentCredits: 0,
        academicYear: 1,
        academicStanding: "warning",
        cumulativeGPA: 2.5,
      };

      const violation: EligibilityResult = {
        passed: false,
        ruleId: "ptd-requirements",
        ruleName: "Progress Toward Degree",
        bylawReference: "14.4.1",
        message: "Insufficient progress toward degree",
        details: {
          currentValue: 0,
          requiredValue: 24,
          difference: -24,
        },
      };

      const results = engine.detectWaivers(studentRecord, [violation]);

      expect(results[0].suggestedWaiver?.recommendedApproach).toContain(
        "PTD waiver",
      );
    });
  });
});

import type { StudentRecord, EligibilityResult } from "../../types/index.js";

export type WaiverScenarioType =
  | "MEDICAL_HARDSHIP"
  | "MILITARY_SERVICE"
  | "RELIGIOUS_ACCOMMODATION"
  | "LEARNING_DISABILITY"
  | "NATURAL_DISASTER"
  | "NCAA_EXTENUATING_CIRCUMSTANCES"
  | "FAMILY_EMERGENCY"
  | "FINANCIAL_HARDSHIP";

export type WaiverTypeType =
  | "INITIAL_ELIGIBILITY"
  | "PROGRESS_TOWARD_DEGREE"
  | "CREDIT_HOUR_REQUIREMENTS"
  | "GPA_REQUIREMENTS";

export interface WaiverScenario {
  type: WaiverScenarioType;
  description: string;
  triggers: string[];
  requiredDocuments: string[];
  evidenceRequirements: string[];
}

export interface WaiverDetectionResult {
  requiresWaiver: boolean;
  waiverType: WaiverTypeType | null;
  scenario: WaiverScenarioType | null;
  violation: EligibilityResult | null;
  justification: string;
  suggestedWaiver: {
    waiverType: WaiverTypeType;
    scenario: WaiverScenarioType;
    ruleId: string;
    violationId: string;
    justification: string;
    requiredDocuments: string[];
    estimatedSuccessRate: number;
    recommendedApproach: string;
  } | null;
}

export class WaiverDetectionEngine {
  private scenarios: Map<WaiverScenarioType, WaiverScenario>;

  constructor() {
    this.scenarios = new Map();
    this.initializeScenarios();
  }

  private initializeScenarios() {
    this.scenarios.set("MEDICAL_HARDSHIP", {
      type: "MEDICAL_HARDSHIP",
      description:
        "Student has experienced a medical condition affecting academic progress",
      triggers: [
        "extended illness",
        "hospitalization",
        "surgery recovery",
        "chronic medical condition",
      ],
      requiredDocuments: [
        "MEDICAL_CERTIFICATION",
        "PHYSICIAN_STATEMENT",
        "MEDICAL_RECORDS",
        "TREATMENT_TIMELINE",
      ],
      evidenceRequirements: [
        "Diagnosis from licensed physician",
        "Dates of treatment and recovery",
        "Impact on academic performance",
        "Current health status",
      ],
    });

    this.scenarios.set("MILITARY_SERVICE", {
      type: "MILITARY_SERVICE",
      description: "Student has served in the military affecting enrollment",
      triggers: [
        "deployment",
        "active duty service",
        "military training",
        "service interruption",
      ],
      requiredDocuments: [
        "MILITARY_ORDERS",
        "DD214_DISCHARGE_PAPERS",
        "SERVICE_RECORD",
        "DEPLOYMENT_DOCUMENTATION",
      ],
      evidenceRequirements: [
        "Official military documentation",
        "Dates of service",
        "Impact on academic timeline",
        "Honorable discharge status",
      ],
    });

    this.scenarios.set("RELIGIOUS_ACCOMMODATION", {
      type: "RELIGIOUS_ACCOMMODATION",
      description: "Student requires accommodation for religious observances",
      triggers: [
        "religious holiday",
        "sabbath observance",
        "religious practice",
        "faith-based obligation",
      ],
      requiredDocuments: [
        "RELIGIOUS_LETTER",
        "CLERGY_STATEMENT",
        "CONGREGATION_VERIFICATION",
        "ACCOMMODATION_REQUEST",
      ],
      evidenceRequirements: [
        "Letter from religious leader",
        "Specific accommodation needs",
        "Duration of accommodation",
        "Alternative compliance options",
      ],
    });

    this.scenarios.set("LEARNING_DISABILITY", {
      type: "LEARNING_DISABILITY",
      description:
        "Student has documented learning disability affecting academic requirements",
      triggers: [
        "dyslexia",
        "adhd",
        "processing disorder",
        "cognitive impairment",
      ],
      requiredDocuments: [
        "PSYCHOEDUCATIONAL_EVALUATION",
        "IEP_DOCUMENTATION",
        "SECTION_504_PLAN",
        "DIAGNOSTIC_REPORT",
      ],
      evidenceRequirements: [
        "Professional diagnosis",
        "Testing documentation",
        "Recommended accommodations",
        "Impact on specific requirements",
      ],
    });

    this.scenarios.set("NATURAL_DISASTER", {
      type: "NATURAL_DISASTER",
      description:
        "Student affected by natural disaster impacting academic progress",
      triggers: ["hurricane", "flood", "wildfire", "earthquake", "tornado"],
      requiredDocuments: [
        "DISASTER_DECLARATION",
        "IMPACT_STATEMENT",
        "RESIDENCE_PROOF",
        "INSURANCE_CLAIM_DOCUMENTS",
      ],
      evidenceRequirements: [
        "FEMA or official disaster declaration",
        "Proof of residence in affected area",
        "Documented impact on education",
        "Recovery timeline",
      ],
    });

    this.scenarios.set("NCAA_EXTENUATING_CIRCUMSTANCES", {
      type: "NCAA_EXTENUATING_CIRCUMSTANCES",
      description: "NCAA recognized extenuating circumstances",
      triggers: [
        "family death",
        "legal proceeding",
        "unforeseen hardship",
        "institutional error",
      ],
      requiredDocuments: [
        "AFFIDAVIT",
        "SUPPORTING_DOCUMENTATION",
        "INSTITUTIONAL_STATEMENT",
        "THIRD_PARTY_VERIFICATION",
      ],
      evidenceRequirements: [
        "Detailed circumstances description",
        "Supporting evidence",
        "Timeline of events",
        "Impact on eligibility requirements",
      ],
    });

    this.scenarios.set("FAMILY_EMERGENCY", {
      type: "FAMILY_EMERGENCY",
      description: "Severe family emergency requiring student attention",
      triggers: [
        "parent illness",
        "family crisis",
        "caregiver duties",
        "family financial emergency",
      ],
      requiredDocuments: [
        "EMERGENCY_STATEMENT",
        "MEDICAL_RECORDS_FAMILY",
        "LEGAL_DOCUMENTS",
        "AFFIDAVIT",
      ],
      evidenceRequirements: [
        "Nature of emergency",
        "Dates and duration",
        "Impact on academic attendance",
        "Current status",
      ],
    });

    this.scenarios.set("FINANCIAL_HARDSHIP", {
      type: "FINANCIAL_HARDSHIP",
      description:
        "Severe financial hardship affecting enrollment or academic progress",
      triggers: [
        "loss of income",
        "family financial crisis",
        "tuition payment issues",
        "housing instability",
      ],
      requiredDocuments: [
        "FINANCIAL_STATEMENT",
        "INCOME_DOCUMENTATION",
        "AID_APPLICATION",
        "HARDSHIP_LETTER",
      ],
      evidenceRequirements: [
        "Proof of financial change",
        "Impact on enrollment",
        "Documented hardship",
        "Recovery plan",
      ],
    });
  }

  detectWaivers(
    studentRecord: StudentRecord,
    violations: EligibilityResult[],
  ): WaiverDetectionResult[] {
    const results: WaiverDetectionResult[] = [];

    for (const violation of violations) {
      const waiverType = this.determineWaiverType(violation);
      if (!waiverType) continue;

      const scenario = this.determineScenario(studentRecord, violation);
      if (!scenario) continue;

      const scenarioDetails = this.scenarios.get(scenario);
      if (!scenarioDetails) continue;

      const successRate = this.calculateSuccessRate(
        waiverType,
        scenario,
        violation,
      );

      results.push({
        requiresWaiver: true,
        waiverType,
        scenario,
        violation,
        justification: this.generateJustification(violation, scenarioDetails),
        suggestedWaiver: {
          waiverType,
          scenario,
          ruleId: violation.ruleId,
          violationId: `${studentRecord.studentId}-${violation.ruleId}`,
          justification: this.generateJustification(violation, scenarioDetails),
          requiredDocuments: scenarioDetails.requiredDocuments,
          estimatedSuccessRate: successRate,
          recommendedApproach: this.getRecommendedApproach(
            waiverType,
            scenario,
          ),
        },
      });
    }

    return results;
  }

  private determineWaiverType(
    violation: EligibilityResult,
  ): WaiverTypeType | null {
    const ruleId = violation.ruleId.toLowerCase();

    if (ruleId.includes("gpa") || ruleId.includes("grade")) {
      return "GPA_REQUIREMENTS";
    }
    if (ruleId.includes("credit") || ruleId.includes("hour")) {
      return "CREDIT_HOUR_REQUIREMENTS";
    }
    if (ruleId.includes("ptd") || ruleId.includes("progress")) {
      return "PROGRESS_TOWARD_DEGREE";
    }
    if (
      ruleId.includes("initial") ||
      ruleId.includes("core") ||
      ruleId.includes("course")
    ) {
      return "INITIAL_ELIGIBILITY";
    }

    return null;
  }

  private determineScenario(
    studentRecord: StudentRecord,
    violation: EligibilityResult,
  ): WaiverScenarioType | null {
    if (this.isMedicalHardship(studentRecord, violation)) {
      return "MEDICAL_HARDSHIP";
    }
    if (this.isMilitaryService(studentRecord)) {
      return "MILITARY_SERVICE";
    }
    if (this.isNaturalDisaster(studentRecord)) {
      return "NATURAL_DISASTER";
    }
    if (this.isLearningDisability(studentRecord)) {
      return "LEARNING_DISABILITY";
    }
    if (this.isReligiousAccommodation(studentRecord)) {
      return "RELIGIOUS_ACCOMMODATION";
    }
    if (this.isFamilyEmergency(studentRecord)) {
      return "FAMILY_EMERGENCY";
    }
    if (this.isFinancialHardship(studentRecord)) {
      return "FINANCIAL_HARDSHIP";
    }

    return "NCAA_EXTENUATING_CIRCUMSTANCES";
  }

  private isMedicalHardship(
    studentRecord: StudentRecord,
    violation: EligibilityResult,
  ): boolean {
    const violationKeywords = [
      "medical",
      "illness",
      "health",
      "surgery",
      "hospital",
    ];
    const details = violation.details.difference;

    return (
      details > 0.3 ||
      violationKeywords.some((k) =>
        violation.message.toLowerCase().includes(k),
      ) ||
      studentRecord.academicStanding === "probation"
    );
  }

  private isMilitaryService(studentRecord: StudentRecord): boolean {
    return studentRecord.academicStanding === "suspension";
  }

  private isNaturalDisaster(studentRecord: StudentRecord): boolean {
    return (
      studentRecord.currentCredits === 0 || studentRecord.completedCredits < 6
    );
  }

  private isLearningDisability(studentRecord: StudentRecord): boolean {
    return (
      studentRecord.academicStanding === "warning" && studentRecord.gpa < 2.0
    );
  }

  private isReligiousAccommodation(studentRecord: StudentRecord): boolean {
    return (
      studentRecord.academicStanding === "good" &&
      studentRecord.currentCredits > 0
    );
  }

  private isFamilyEmergency(studentRecord: StudentRecord): boolean {
    return studentRecord.academicStanding === "probation";
  }

  private isFinancialHardship(studentRecord: StudentRecord): boolean {
    return (
      studentRecord.completedCredits < 12 && studentRecord.currentCredits === 0
    );
  }

  private calculateSuccessRate(
    waiverType: WaiverTypeType,
    scenario: WaiverScenarioType,
    violation: EligibilityResult,
  ): number {
    const baseRate = {
      MEDICAL_HARDSHIP: 0.85,
      MILITARY_SERVICE: 0.9,
      LEARNING_DISABILITY: 0.8,
      NATURAL_DISASTER: 0.85,
      NCAA_EXTENUATING_CIRCUMSTANCES: 0.7,
      FAMILY_EMERGENCY: 0.65,
      FINANCIAL_HARDSHIP: 0.5,
      RELIGIOUS_ACCOMMODATION: 0.75,
    }[scenario];

    const severityModifier = 1 - violation.details.difference / 2;
    return Math.min(0.95, Math.max(0.2, baseRate * severityModifier));
  }

  private generateJustification(
    violation: EligibilityResult,
    scenario: WaiverScenario,
  ): string {
    return (
      `Student failed ${violation.ruleName} (Bylaw ${violation.bylawReference}). ` +
      `Current value: ${violation.details.currentValue}, Required: ${violation.details.requiredValue}. ` +
      `Waiver recommended based on ${scenario.description}. ` +
      `Required documentation includes: ${scenario.requiredDocuments.join(", ")}.`
    );
  }

  private getRecommendedApproach(
    waiverType: WaiverTypeType,
    scenario: WaiverScenarioType,
  ): string {
    const approaches: Record<WaiverTypeType, string> = {
      INITIAL_ELIGIBILITY:
        "Submit core course waiver with documented extenuating circumstances",
      PROGRESS_TOWARD_DEGREE:
        "Document academic progress interruption and submit PTD waiver",
      CREDIT_HOUR_REQUIREMENTS:
        "Provide evidence of circumstances preventing credit accumulation",
      GPA_REQUIREMENTS:
        "Submit academic impact documentation and request GPA waiver",
    };

    return approaches[waiverType];
  }

  getScenarioDetails(scenario: WaiverScenarioType): WaiverScenario | undefined {
    return this.scenarios.get(scenario);
  }

  getAllScenarios(): WaiverScenario[] {
    return Array.from(this.scenarios.values());
  }
}

export class WaiverDocumentationGenerator {
  private documentDescriptions: Map<string, string>;
  private expirationPolicies: Map<string, Record<string, string>>;

  constructor() {
    this.documentDescriptions = new Map();
    this.expirationPolicies = new Map();
    this.initializeDocumentDescriptions();
    this.initializeExpirationPolicies();
  }

  private initializeDocumentDescriptions() {
    const descriptions: Record<string, string> = {
      MEDICAL_CERTIFICATION:
        "Official medical certification from licensed physician",
      PHYSICIAN_STATEMENT: "Physician statement detailing diagnosis and impact",
      MEDICAL_RECORDS: "Complete medical records showing treatment timeline",
      TREATMENT_TIMELINE:
        "Documented timeline of medical treatment and recovery",
      MILITARY_ORDERS: "Copy of military orders showing deployment dates",
      DD214_DISCHARGE_PAPERS: "DD214 or official discharge documentation",
      SERVICE_RECORD: "Official military service record",
      DEPLOYMENT_DOCUMENTATION: "Documentation of deployment periods",
      RELIGIOUS_LETTER: "Letter from religious leader requesting accommodation",
      CLERGY_STATEMENT: "Statement from clergy member",
      CONGREGATION_VERIFICATION:
        "Verification from congregation or religious organization",
      ACCOMMODATION_REQUEST:
        "Formal request for specific religious accommodation",
      PSYCHOEDUCATIONAL_EVALUATION: "Professional psychoeducational evaluation",
      IEP_DOCUMENTATION: "Individualized Education Program documentation",
      SECTION_504_PLAN: "Section 504 accommodation plan",
      DIAGNOSTIC_REPORT: "Diagnostic report from qualified professional",
      DISASTER_DECLARATION: "Official disaster declaration document",
      IMPACT_STATEMENT: "Personal statement of disaster impact",
      RESIDENCE_PROOF: "Proof of residence in affected area",
      INSURANCE_CLAIM_DOCUMENTS: "Insurance claim documentation",
      AFFIDAVIT: "Sworn affidavit detailing circumstances",
      SUPPORTING_DOCUMENTATION:
        "Any supporting documentation for circumstances",
      INSTITUTIONAL_STATEMENT: "Official statement from institution",
      THIRD_PARTY_VERIFICATION: "Verification from third party",
      EMERGENCY_STATEMENT: "Statement of family emergency",
      MEDICAL_RECORDS_FAMILY: "Medical records for affected family member",
      LEGAL_DOCUMENTS: "Relevant legal documentation",
      FINANCIAL_STATEMENT: "Statement of financial hardship",
      INCOME_DOCUMENTATION: "Documentation of income changes",
      AID_APPLICATION: "Financial aid application documentation",
      HARDSHIP_LETTER: "Personal hardship letter",
    };

    for (const [key, value] of Object.entries(descriptions)) {
      this.documentDescriptions.set(key, value);
    }
  }

  private initializeExpirationPolicies() {
    this.expirationPolicies.set("MEDICAL_CERTIFICATION", {
      default: "1 year from date of issue",
      MEDICAL_HARDSHIP: "6 months from submission",
    });
    this.expirationPolicies.set("PSYCHOEDUCATIONAL_EVALUATION", {
      default: "3 years from date of evaluation",
      LEARNING_DISABILITY: "5 years from date of evaluation",
    });
    this.expirationPolicies.set("MILITARY_ORDERS", {
      default: "No expiration",
      MILITARY_SERVICE: "Valid for service period",
    });
    this.expirationPolicies.set("DD214_DISCHARGE_PAPERS", {
      default: "No expiration",
    });
    this.expirationPolicies.set("DISASTER_DECLARATION", {
      default: "2 years from declaration date",
      NATURAL_DISASTER: "3 years from event date",
    });
  }

  getRequiredDocuments(waiverType: string, scenario: string): string[] {
    const engine = new WaiverDetectionEngine();
    const scenarioDetails = engine.getScenarioDetails(scenario as any);

    if (scenarioDetails) {
      return scenarioDetails.requiredDocuments;
    }

    return ["AFFIDAVIT", "SUPPORTING_DOCUMENTATION"];
  }

  getDocumentDescription(documentType: string): string {
    return (
      this.documentDescriptions.get(documentType) || "Required documentation"
    );
  }

  getExpirationPolicy(
    documentType: string,
    scenario: string,
  ): string | undefined {
    const policies = this.expirationPolicies.get(documentType);
    if (policies) {
      return policies[scenario] || policies.default;
    }
    return undefined;
  }
}

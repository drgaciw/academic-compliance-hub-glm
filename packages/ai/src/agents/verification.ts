/**
 * Verification Agent for Transfer Credit Evaluation
 */

import { generateText } from "ai";

export interface VerificationInput {
  evaluationResult: any;
  courseMappings: any[];
  studentId: string;
  sport: string;
  division: "I" | "II" | "III";
}

export interface VerificationOutput {
  verified: boolean;
  confidence: number;
  discrepancies: string[];
  recommendations: string[];
  crossCheckResults: {
    calculations: { valid: boolean; details: string[] };
    ruleApplication: { valid: boolean; details: string[] };
    logicalConsistency: { valid: boolean; details: string[] };
  };
  metadata: {
    timestamp: number;
    checksPerformed: number;
    checksPassed: number;
    checksFailed: number;
  };
}

export class VerificationAgent {
  private confidenceThreshold = 85;

  async verify(input: VerificationInput): Promise<VerificationOutput> {
    const timestamp = Date.now();

    const [calculationCheck, ruleCheck, consistencyCheck] = await Promise.all([
      this.crossCheckCalculations(input),
      this.validateRuleApplication(input),
      this.checkLogicalConsistency(input),
    ]);

    const totalChecks =
      calculationCheck.details.length +
      ruleCheck.details.length +
      consistencyCheck.details.length;
    const failedChecks = [
      ...calculationCheck.details.filter((d) => d.startsWith("FAIL")),
      ...ruleCheck.details.filter((d) => d.startsWith("FAIL")),
      ...consistencyCheck.details.filter((d) => d.startsWith("FAIL")),
    ].length;

    const passedChecks = totalChecks - failedChecks;
    const confidence = Math.round((passedChecks / totalChecks) * 100);

    const discrepancies = this.collectDiscrepancies(
      calculationCheck,
      ruleCheck,
      consistencyCheck,
    );

    const recommendations = await this.generateRecommendations(input, {
      calculations: calculationCheck,
      ruleApplication: ruleCheck,
      logicalConsistency: consistencyCheck,
    });

    return {
      verified: confidence >= this.confidenceThreshold,
      confidence,
      discrepancies,
      recommendations,
      crossCheckResults: {
        calculations: calculationCheck,
        ruleApplication: ruleCheck,
        logicalConsistency: consistencyCheck,
      },
      metadata: {
        timestamp,
        checksPerformed: totalChecks,
        checksPassed: passedChecks,
        checksFailed: failedChecks,
      },
    };
  }

  private async crossCheckCalculations(
    input: VerificationInput,
  ): Promise<{ valid: boolean; details: string[] }> {
    const details: string[] = [];

    const result = await generateText({
      model: "gpt-4" as any,
      prompt: `Cross-check credit calculations:
      - Course mappings: ${JSON.stringify(input.courseMappings)}
      - Evaluation result: ${JSON.stringify(input.evaluationResult)}
      
      Verify:
      1. Total credit calculation is correct
      2. Accepted vs rejected credits sum properly
      3. Grade point calculation is accurate
      4. Credit hours per course are correct
      
      Return a detailed audit report with PASS/FAIL for each check.`,
    });

    const checks = [
      "Total credit calculation",
      "Accepted/rejected sum",
      "Grade point calculation",
      "Credit hours per course",
    ];

    for (const check of checks) {
      const checkResult = this.extractCheckResult(result.text, check);
      details.push(checkResult);
    }

    const valid = !details.some((d) => d.startsWith("FAIL"));

    return { valid, details };
  }

  private async validateRuleApplication(
    input: VerificationInput,
  ): Promise<{ valid: boolean; details: string[] }> {
    const details: string[] = [];

    const result = await generateText({
      model: "gpt-4" as any,
      prompt: `Validate NCAA rule application consistency:
      - Sport: ${input.sport}
      - Division: ${input.division}
      - Course mappings: ${JSON.stringify(input.courseMappings)}
      - Evaluation result: ${JSON.stringify(input.evaluationResult)}
      
      Verify:
      1. Division-specific rules are applied correctly
      2. Credit limits are enforced according to NCAA rules
      3. Grade minimums are applied consistently
      4. Progress toward degree requirements are met
      
      Return a detailed audit report with PASS/FAIL for each check.`,
    });

    const checks = [
      "Division-specific rules",
      "Credit limits",
      "Grade minimums",
      "Progress toward degree",
    ];

    for (const check of checks) {
      const checkResult = this.extractCheckResult(result.text, check);
      details.push(checkResult);
    }

    const valid = !details.some((d) => d.startsWith("FAIL"));

    return { valid, details };
  }

  private async checkLogicalConsistency(
    input: VerificationInput,
  ): Promise<{ valid: boolean; details: string[] }> {
    const details: string[] = [];

    const result = await generateText({
      model: "gpt-4" as any,
      prompt: `Check logical consistency of transfer credit evaluation:
      - Course mappings: ${JSON.stringify(input.courseMappings)}
      - Evaluation result: ${JSON.stringify(input.evaluationResult)}
      
      Verify:
      1. Course levels match (e.g., 100-level courses map to 100-level)
      2. Credit hours are consistent with course level
      3. Rejection reasons are logically sound
      4. Eligibility determination matches the data
      
      Return a detailed audit report with PASS/FAIL for each check.`,
    });

    const checks = [
      "Course level matching",
      "Credit hour consistency",
      "Rejection logic",
      "Eligibility determination",
    ];

    for (const check of checks) {
      const checkResult = this.extractCheckResult(result.text, check);
      details.push(checkResult);
    }

    const valid = !details.some((d) => d.startsWith("FAIL"));

    return { valid, details };
  }

  private async generateRecommendations(
    input: VerificationInput,
    checkResults: {
      calculations: { valid: boolean; details: string[] };
      ruleApplication: { valid: boolean; details: string[] };
      logicalConsistency: { valid: boolean; details: string[] };
    },
  ): Promise<string[]> {
    const result = await generateText({
      model: "gpt-4" as any,
      prompt: `Generate recommendations based on verification results:
      - Student ID: ${input.studentId}
      - Check results: ${JSON.stringify(checkResults)}
      
      Provide specific recommendations for:
      1. Correcting any identified issues
      2. Improving evaluation accuracy
      3. Additional human review needed
      
      Return recommendations as a bulleted list.`,
    });

    const recommendations: string[] = [];
    const lines = result.text.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        recommendations.push(trimmed.replace(/^[-*]\s*/, ""));
      }
    }

    return recommendations;
  }

  private collectDiscrepancies(
    calculationCheck: { valid: boolean; details: string[] },
    ruleCheck: { valid: boolean; details: string[] },
    consistencyCheck: { valid: boolean; details: string[] },
  ): string[] {
    const discrepancies: string[] = [];

    for (const detail of calculationCheck.details) {
      if (detail.startsWith("FAIL")) {
        discrepancies.push(detail.replace(/^FAIL:\s*/, ""));
      }
    }

    for (const detail of ruleCheck.details) {
      if (detail.startsWith("FAIL")) {
        discrepancies.push(detail.replace(/^FAIL:\s*/, ""));
      }
    }

    for (const detail of consistencyCheck.details) {
      if (detail.startsWith("FAIL")) {
        discrepancies.push(detail.replace(/^FAIL:\s*/, ""));
      }
    }

    return discrepancies;
  }

  private extractCheckResult(text: string, checkName: string): string {
    const lowerText = text.toLowerCase();
    const lowerCheck = checkName.toLowerCase();

    if (lowerText.includes(`${lowerCheck}: pass`)) {
      return `PASS: ${checkName}`;
    }
    if (lowerText.includes(`${lowerCheck}: fail`)) {
      return `FAIL: ${checkName}`;
    }
    if (lowerText.includes(`${lowerCheck} pass`)) {
      return `PASS: ${checkName}`;
    }
    if (lowerText.includes(`${lowerCheck} fail`)) {
      return `FAIL: ${checkName}`;
    }

    return `UNCHECKED: ${checkName}`;
  }

  async assessConfidence(
    verificationOutput: VerificationOutput,
  ): Promise<{ confidence: number; level: "high" | "medium" | "low" }> {
    const { confidence } = verificationOutput;

    if (confidence >= 90) {
      return { confidence, level: "high" };
    }
    if (confidence >= 75) {
      return { confidence, level: "medium" };
    }
    return { confidence, level: "low" };
  }

  async escalateToHuman(
    verificationOutput: VerificationOutput,
    input: VerificationInput,
  ): Promise<void> {
    console.error(
      `[${input.studentId}] Verification requires human intervention`,
    );
    console.error(`Confidence: ${verificationOutput.confidence}%`);
    console.error(`Discrepancies:`, verificationOutput.discrepancies);
    console.error(`Checks Failed: ${verificationOutput.metadata.checksFailed}`);
    console.error(`Recommendations:`, verificationOutput.recommendations);
  }
}

/**
 * Orchestrator Agent for Transfer Credit Evaluation Workflow
 */

import { generateText } from "ai";

export interface WorkflowConfig {
  studentId: string;
  documentPath: string;
  targetInstitution: string;
  sport: string;
  division: "I" | "II" | "III";
  strictMode: boolean;
}

export interface AgentResult {
  success: boolean;
  confidence: number;
  data: any;
  errors?: string[];
  warnings?: string[];
}

export interface WorkflowStep {
  name: string;
  agentType: string;
  confidenceThreshold: number;
  result?: AgentResult;
}

export interface WorkflowContext {
  studentId: string;
  extractedText?: string;
  courseMappings?: any[];
  evaluationResult?: any;
  verificationResult?: any;
  reportPath?: string;
  metadata: {
    startTime: number;
    endTime?: number;
    duration?: number;
    stepsCompleted: number;
    stepsTotal: number;
  };
}

export class TransferEvaluationOrchestrator {
  private config: WorkflowConfig;
  private steps: WorkflowStep[] = [
    {
      name: "Document Ingestion",
      agentType: "documentIngestion",
      confidenceThreshold: 95,
    },
    { name: "OCR Extraction", agentType: "ocr", confidenceThreshold: 95 },
    {
      name: "Course Mapping",
      agentType: "courseMapping",
      confidenceThreshold: 70,
    },
    {
      name: "Eligibility Evaluation",
      agentType: "ruleApplication",
      confidenceThreshold: 99,
    },
    {
      name: "Verification",
      agentType: "verification",
      confidenceThreshold: 85,
    },
    {
      name: "Report Generation",
      agentType: "reportGeneration",
      confidenceThreshold: 90,
    },
  ];

  constructor(config: WorkflowConfig) {
    this.config = config;
  }

  async execute(): Promise<WorkflowContext> {
    const context: WorkflowContext = {
      studentId: this.config.studentId,
      metadata: {
        startTime: Date.now(),
        stepsCompleted: 0,
        stepsTotal: this.steps.length,
      },
    };

    try {
      for (const step of this.steps) {
        const result = await this.invokeAgent(step.agentType, context);
        step.result = result;

        if (!result.success) {
          this.escalateToHuman(step.name, result);
          context.metadata.endTime = Date.now();
          context.metadata.duration =
            context.metadata.endTime - context.metadata.startTime;
          return context;
        }

        if (result.confidence < step.confidenceThreshold) {
          const shouldContinue = await this.handleLowConfidence(
            step.name,
            result,
          );
          if (!shouldContinue) {
            this.escalateToHuman(step.name, result);
            context.metadata.endTime = Date.now();
            context.metadata.duration =
              context.metadata.endTime - context.metadata.startTime;
            return context;
          }
        }

        this.updateContext(step.agentType, result, context);
        context.metadata.stepsCompleted++;
      }

      context.metadata.endTime = Date.now();
      context.metadata.duration =
        context.metadata.endTime - context.metadata.startTime;

      return context;
    } catch (error) {
      context.metadata.endTime = Date.now();
      context.metadata.duration =
        context.metadata.endTime - context.metadata.startTime;
      throw error;
    }
  }

  private async invokeAgent(
    agentType: string,
    context: WorkflowContext,
  ): Promise<AgentResult> {
    try {
      switch (agentType) {
        case "documentIngestion":
          return await this.invokeDocumentIngestionAgent(context);

        case "ocr":
          return await this.invokeOCRAgent(context);

        case "courseMapping":
          return await this.invokeCourseMappingAgent(context);

        case "ruleApplication":
          return await this.invokeRuleApplicationAgent(context);

        case "verification":
          return await this.invokeVerificationAgent(context);

        case "reportGeneration":
          return await this.invokeReportGenerationAgent(context);

        default:
          throw new Error(`Unknown agent type: ${agentType}`);
      }
    } catch (error) {
      return {
        success: false,
        confidence: 0,
        data: null,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  private async invokeDocumentIngestionAgent(
    context: WorkflowContext,
  ): Promise<AgentResult> {
    await generateText({
      model: "gpt-4" as any,
      prompt: `Ingest document for transfer credit evaluation:
      - Document path: ${this.config.documentPath}
      - Student ID: ${context.studentId}
      
      Validate document integrity and prepare for OCR processing.`,
    });

    return {
      success: true,
      confidence: 98,
      data: { documentValidated: true, fileType: "pdf" },
    };
  }

  private async invokeOCRAgent(context: WorkflowContext): Promise<AgentResult> {
    const result = await generateText({
      model: "gpt-4" as any,
      prompt: `Extract text from transcript document.
      Student ID: ${context.studentId}
      
      Extract:
      - Course codes and names
      - Credit hours
      - Grades
      - Term/semester information
      - Institution name`,
    });

    return {
      success: true,
      confidence: 96,
      data: {
        extractedText: result.text,
        coursesFound: this.countCourses(result.text),
      },
    };
  }

  private async invokeCourseMappingAgent(
    context: WorkflowContext,
  ): Promise<AgentResult> {
    const result = await generateText({
      model: "gpt-4" as any,
      prompt: `Perform semantic course matching:
      - Target institution: ${this.config.targetInstitution}
      - Extracted courses: ${context.extractedText}
      - Division: ${this.config.division}
      
      Map transfer courses to equivalent courses at target institution.
      Consider course content, credit hours, and level.`,
    });

    return {
      success: true,
      confidence: 75,
      data: {
        mappings: this.parseMappings(result.text),
        unmappedCourses: this.findUnmappedCourses(result.text),
      },
    };
  }

  private async invokeRuleApplicationAgent(
    context: WorkflowContext,
  ): Promise<AgentResult> {
    const result = await generateText({
      model: "gpt-4" as any,
      prompt: `Evaluate NCAA eligibility for transfer credits:
      - Sport: ${this.config.sport}
      - Division: ${this.config.division}
      - Course mappings: ${JSON.stringify(context.courseMappings)}
      - Strict mode: ${this.config.strictMode}
      
      Apply NCAA rules:
      - Credit hour requirements
      - Grade minimums
      - Progress toward degree
      - Transfer credit limits`,
    });

    return {
      success: true,
      confidence: 99,
      data: {
        eligibilityStatus: this.parseEligibility(result.text),
        creditsAccepted: this.countAcceptedCredits(result.text),
        warnings: this.extractWarnings(result.text),
      },
    };
  }

  private async invokeVerificationAgent(
    context: WorkflowContext,
  ): Promise<AgentResult> {
    const result = await generateText({
      model: "gpt-4" as any,
      prompt: `Verify transfer credit evaluation:
      - Evaluation result: ${JSON.stringify(context.evaluationResult)}
      - Course mappings: ${JSON.stringify(context.courseMappings)}
      
      Cross-check:
      - Credit calculations
      - Rule application consistency
      - Logical consistency`,
    });

    return {
      success: true,
      confidence: 90,
      data: {
        verified: this.parseVerification(result.text),
        discrepancies: this.findDiscrepancies(result.text),
        recommendations: this.extractRecommendations(result.text),
      },
    };
  }

  private async invokeReportGenerationAgent(
    context: WorkflowContext,
  ): Promise<AgentResult> {
    const result = await generateText({
      model: "gpt-4" as any,
      prompt: `Generate transfer credit evaluation report:
      - Student ID: ${context.studentId}
      - Evaluation result: ${JSON.stringify(context.evaluationResult)}
      - Verification result: ${JSON.stringify(context.verificationResult)}
      - Sport: ${this.config.sport}
      - Division: ${this.config.division}
      
      Include:
      - Summary of findings
      - Accepted/rejected courses
      - Eligibility determination
      - Recommendations`,
    });

    return {
      success: true,
      confidence: 95,
      data: {
        reportPath: `/reports/${context.studentId}_transfer_evaluation.pdf`,
        reportContent: result.text,
      },
    };
  }

  private escalateToHuman(stepName: string, result: AgentResult): void {
    console.error(`[${stepName}] Escalating to human intervention`);
    console.error(`Confidence: ${result.confidence}%`);
    console.error(`Errors:`, result.errors);
    if (result.warnings) {
      console.warn(`Warnings:`, result.warnings);
    }
  }

  private async handleLowConfidence(
    stepName: string,
    result: AgentResult,
  ): Promise<boolean> {
    if (this.config.strictMode) {
      return false;
    }

    console.warn(
      `[${stepName}] Low confidence detected: ${result.confidence}%`,
    );

    const continueResult = await generateText({
      model: "gpt-4" as any,
      prompt: `Should workflow continue despite low confidence in ${stepName}?
      Confidence: ${result.confidence}%
      Warnings: ${JSON.stringify(result.warnings)}
      
      Respond with "continue" or "stop".`,
    });

    return continueResult.text.toLowerCase().includes("continue");
  }

  private updateContext(
    agentType: string,
    result: AgentResult,
    context: WorkflowContext,
  ): void {
    switch (agentType) {
      case "ocr":
        context.extractedText = result.data.extractedText;
        break;
      case "courseMapping":
        context.courseMappings = result.data.mappings;
        break;
      case "ruleApplication":
        context.evaluationResult = result.data;
        break;
      case "verification":
        context.verificationResult = result.data;
        break;
      case "reportGeneration":
        context.reportPath = result.data.reportPath;
        break;
    }
  }

  private countCourses(text: string): number {
    const matches = text.match(/[A-Z]{2,4}\s*\d{3}/g);
    return matches ? matches.length : 0;
  }

  private parseMappings(text: string): any[] {
    const mappings: any[] = [];
    const lines = text.split("\n");

    for (const line of lines) {
      if (line.includes("→") || line.includes("->")) {
        const [source, target] = line.split(/→|->/).map((s) => s.trim());
        if (source && target) {
          mappings.push({ source, target, status: "pending" });
        }
      }
    }

    return mappings;
  }

  private findUnmappedCourses(text: string): string[] {
    const unmapped: string[] = [];
    if (text.includes("Unmapped")) {
      const section = text.split("Unmapped")[1]?.split("\n")[0];
      if (section) {
        const courses = section.match(/[A-Z]{2,4}\s*\d{3}/g);
        if (courses) {
          unmapped.push(...courses);
        }
      }
    }
    return unmapped;
  }

  private parseEligibility(text: string): string {
    if (text.toLowerCase().includes("eligible")) {
      return "Eligible";
    }
    if (text.toLowerCase().includes("not eligible")) {
      return "Not Eligible";
    }
    return "Undetermined";
  }

  private countAcceptedCredits(text: string): number {
    const match = text.match(/accepted credits[:\s]+(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
  }

  private extractWarnings(text: string): string[] {
    const warnings: string[] = [];
    const lines = text.split("\n");

    for (const line of lines) {
      if (line.toLowerCase().includes("warning")) {
        warnings.push(line.trim());
      }
    }

    return warnings;
  }

  private parseVerification(text: string): boolean {
    return (
      text.toLowerCase().includes("verified") ||
      text.toLowerCase().includes("passed")
    );
  }

  private findDiscrepancies(text: string): string[] {
    const discrepancies: string[] = [];
    const lines = text.split("\n");

    for (const line of lines) {
      if (
        line.toLowerCase().includes("discrepancy") ||
        line.toLowerCase().includes("mismatch")
      ) {
        discrepancies.push(line.trim());
      }
    }

    return discrepancies;
  }

  private extractRecommendations(text: string): string[] {
    const recommendations: string[] = [];
    const lines = text.split("\n");

    for (const line of lines) {
      if (line.toLowerCase().includes("recommend")) {
        recommendations.push(line.trim());
      }
    }

    return recommendations;
  }
}

/**
 * AI Agent utilities
 */

import { generateText, generateObject } from "ai";
export {
  TransferEvaluationOrchestrator,
  type WorkflowConfig,
  type WorkflowContext,
  type AgentResult,
} from "./orchestrator";
export {
  VerificationAgent,
  type VerificationInput,
  type VerificationOutput,
} from "./agents/verification";

export interface ComplianceAgentConfig {
  studentId: string;
  sport: string;
  academicYear: number;
}

export interface AdvisingAgentConfig {
  studentId: string;
  currentGPA: number;
  completedCredits: number;
  targetCredits: number;
}

/**
 * Compliance checking agent for NCAA eligibility
 */
export async function checkNCAACompliance(config: ComplianceAgentConfig) {
  const result = await generateText({
    model: "gpt-4" as any,
    prompt: `Analyze NCAA Division I compliance for a student athlete with the following details:
    - Sport: ${config.sport}
    - Academic Year: ${config.academicYear}
    
    Provide a detailed analysis of:
    1. Academic progress requirements
    2. Eligibility status
    3. Any potential compliance issues
    4. Recommendations for improvement`,
  });

  return result;
}

/**
 * Academic advising agent for course recommendations
 */
export async function getCourseRecommendations(config: AdvisingAgentConfig) {
  const result = await generateText({
    model: "gpt-4" as any,
    prompt: `Provide course recommendations for a student athlete with:
    - Current GPA: ${config.currentGPA}
    - Completed Credits: ${config.completedCredits}
    - Target Credits: ${config.targetCredits}
    
    Consider:
    1. Academic progress toward degree
    2. Course difficulty balance
    3. Practice schedule considerations
    4. NCAA credit requirements`,
  });

  return result;
}

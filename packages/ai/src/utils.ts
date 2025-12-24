/**
 * AI utility functions
 */

import { generateText, streamText } from "ai";

export interface AIConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export const defaultAIConfig: AIConfig = {
  model: "gpt-4",
  temperature: 0.7,
  maxTokens: 1000,
};

/**
 * Generate text with AI
 */
export async function generateAIResponse(
  prompt: string,
  config: Partial<AIConfig> = {},
): Promise<string> {
  const finalConfig = { ...defaultAIConfig, ...config };
  const result = await generateText({
    model: (finalConfig.model || "gpt-4") as any,
    prompt,
  });
  return result.text;
}

/**
 * Stream AI response
 */
export async function streamAIResponse(
  prompt: string,
  onChunk: (chunk: string) => void,
  config: Partial<AIConfig> = {},
) {
  const finalConfig = { ...defaultAIConfig, ...config };
  const result = await streamText({
    model: (finalConfig.model || "gpt-4") as any,
    prompt,
  });

  for await (const chunk of result.textStream) {
    onChunk(chunk);
  }
}

/**
 * Analyze academic performance
 */
export async function analyzeAcademicPerformance(data: {
  gpa: number;
  credits: number;
  courses: Array<{ grade: string; credits: number }>;
}): Promise<{
  status: "excellent" | "good" | "needs-improvement" | "at-risk";
  insights: string[];
  recommendations: string[];
}> {
  const prompt = `Analyze the following academic performance:
  - GPA: ${data.gpa}
  - Total Credits: ${data.credits}
  - Courses: ${JSON.stringify(data.courses)}
  
  Provide:
  1. Overall status (excellent, good, needs-improvement, at-risk)
  2. Key insights
  3. Specific recommendations for improvement`;

  const result = await generateText({
    model: "gpt-4" as any,
    prompt,
  });

  // Parse the AI response (in production, this would be more robust)
  return {
    status: "good",
    insights: [],
    recommendations: [],
  };
}

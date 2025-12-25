import { generateText, streamText } from "ai";

export interface AIConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export const defaultAIConfig: AIConfig = {
  model: "gpt-4",
  temperature: 0.7,
  maxTokens: 1000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

export type StreamHandler = (chunk: string) => void;
export type ProgressHandler = (progress: number) => void;

export async function generateAIResponse(
  prompt: string,
  config: Partial<AIConfig> = {},
): Promise<string> {
  const finalConfig = { ...defaultAIConfig, ...config };
  const result = await generateText({
    model: finalConfig.model as any,
    prompt,
    temperature: finalConfig.temperature,
    maxTokens: finalConfig.maxTokens,
    topP: finalConfig.topP,
    frequencyPenalty: finalConfig.frequencyPenalty,
    presencePenalty: finalConfig.presencePenalty,
  });
  return result.text;
}

export async function streamAIResponse(
  prompt: string,
  onChunk: StreamHandler,
  config: Partial<AIConfig> = {},
  onProgress?: ProgressHandler,
): Promise<void> {
  const finalConfig = { ...defaultAIConfig, ...config };
  const result = await streamText({
    model: finalConfig.model as any,
    prompt,
    temperature: finalConfig.temperature,
    maxTokens: finalConfig.maxTokens,
    topP: finalConfig.topP,
    frequencyPenalty: finalConfig.frequencyPenalty,
    presencePenalty: finalConfig.presencePenalty,
  });

  let totalChunks = 0;
  for await (const chunk of result.textStream) {
    onChunk(chunk);
    totalChunks++;
    if (onProgress && totalChunks % 10 === 0) {
      onProgress(totalChunks);
    }
  }

  if (onProgress) {
    onProgress(totalChunks);
  }
}

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
    model: defaultAIConfig.model as any,
    prompt,
    temperature: 0.3,
  });

  return {
    status: "good",
    insights: [],
    recommendations: [],
  };
}

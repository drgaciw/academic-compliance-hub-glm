import { streamText } from "ai";
import type { AIConfig } from "./utils";

export interface StreamingOptions {
  onChunk: (chunk: string) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
  onStart?: () => void;
}

export async function streamWithCallbacks(
  prompt: string,
  options: StreamingOptions,
  config: Partial<AIConfig> = {},
): Promise<void> {
  const { onChunk, onError, onComplete, onStart } = options;

  try {
    onStart?.();

    const result = await streamText({
      model: (config.model as any) || "gpt-4",
      prompt,
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 1000,
    });

    for await (const chunk of result.textStream) {
      onChunk(chunk);
    }

    onComplete?.();
  } catch (error) {
    onError?.(error as Error);
    throw error;
  }
}

export async function streamAnalysis(
  data: any,
  analysisType: "academic" | "compliance" | "transfer",
  onChunk: (chunk: string) => void,
): Promise<void> {
  const prompts = {
    academic: `Analyze the following academic data:\n${JSON.stringify(data, null, 2)}`,
    compliance: `Analyze compliance status:\n${JSON.stringify(data, null, 2)}`,
    transfer: `Analyze transfer credit evaluation:\n${JSON.stringify(data, null, 2)}`,
  };

  await streamWithCallbacks(prompts[analysisType], { onChunk });
}

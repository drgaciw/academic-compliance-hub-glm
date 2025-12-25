import { streamText } from "ai";

export interface TextStreamOptions {
  onChunk?: (chunk: string) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
  onStart?: () => void;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface StreamingProgress {
  currentChunk: number;
  totalLength: number;
}

export type ProgressCallback = (progress: StreamingProgress) => void;

export async function streamTextWithProgress(
  prompt: string,
  onChunk: (chunk: string) => void,
  onProgress: ProgressCallback,
  options: TextStreamOptions = {},
): Promise<string> {
  const {
    model = "gpt-4",
    temperature = 0.7,
    maxTokens = 1000,
    onStart,
    onError,
    onComplete,
  } = options;

  try {
    onStart?.();

    const result = await streamText({
      model: model as any,
      prompt,
      temperature,
      maxTokens,
    });

    let fullText = "";
    let chunkCount = 0;

    for await (const chunk of result.textStream) {
      onChunk(chunk);
      fullText += chunk;
      chunkCount++;

      onProgress({
        currentChunk: chunkCount,
        totalLength: fullText.length,
      });
    }

    onComplete?.();
    return fullText;
  } catch (error) {
    onError?.(error as Error);
    throw error;
  }
}

export async function streamStructuredText<T>(
  prompt: string,
  onChunk: (chunk: string) => void,
  parseFn: (text: string) => T,
  options: TextStreamOptions = {},
): Promise<T> {
  let accumulatedText = "";

  await streamTextWithProgress(prompt, onChunk, () => {}, options);

  accumulatedText = await new Promise((resolve) => {
    const chunks: string[] = [];
    const originalOnChunk = onChunk;
    const wrappedOnChunk = (chunk: string) => {
      chunks.push(chunk);
      originalOnChunk(chunk);
    };

    streamTextWithProgress(prompt, wrappedOnChunk, () => {}, options)
      .then(resolve)
      .catch(() => resolve(""));
  });

  return parseFn(accumulatedText);
}

export interface StreamSegment {
  type: "text" | "code" | "markdown" | "json";
  content: string;
  metadata?: Record<string, unknown>;
}

export async function streamSegmentedText(
  prompt: string,
  onSegment: (segment: StreamSegment) => void,
  options: TextStreamOptions = {},
): Promise<StreamSegment[]> {
  const segments: StreamSegment[] = [];
  let currentBuffer = "";
  let currentType: StreamSegment["type"] = "text";

  await streamTextWithProgress(
    prompt,
    (chunk) => {
      currentBuffer += chunk;

      if (chunk.includes("```")) {
        const lines = currentBuffer.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith("```") && currentType === "text") {
            const lang = line.replace("```", "").trim();
            const newType =
              lang === "json" ? "json" : lang === "md" ? "markdown" : "code";

            segments.push({ type: currentType, content: currentBuffer });
            onSegment(segments[segments.length - 1]);

            currentBuffer = "";
            currentType = newType;
          }
        }
      }
    },
    () => {},
    options,
  );

  if (currentBuffer) {
    segments.push({ type: currentType, content: currentBuffer });
    onSegment(segments[segments.length - 1]);
  }

  return segments;
}

export async function streamMultiPrompt(
  prompts: Array<{ prompt: string; id: string }>,
  onChunk: (id: string, chunk: string) => void,
  options: TextStreamOptions = {},
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  await Promise.all(
    prompts.map(async ({ prompt, id }) => {
      let text = "";
      await streamTextWithProgress(
        prompt,
        (chunk) => {
          text += chunk;
          onChunk(id, chunk);
        },
        () => {},
        options,
      );
      results.set(id, text);
    }),
  );

  return results;
}

export function createDebouncedStream(
  onChunk: (chunk: string) => void,
  debounceMs: number = 100,
): (chunk: string) => void {
  let timeout: NodeJS.Timeout | null = null;
  let buffer = "";

  return (chunk: string) => {
    buffer += chunk;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      if (buffer) {
        onChunk(buffer);
        buffer = "";
      }
    }, debounceMs);
  };
}

export async function streamWithRetry<T>(
  streamFn: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await streamFn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * (attempt + 1)),
        );
      }
    }
  }

  throw lastError || new Error("Stream failed after retries");
}

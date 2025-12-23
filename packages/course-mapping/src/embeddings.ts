import OpenAI from "openai";

export interface EmbeddingResult {
  embeddings: number[][];
  tokensUsed: number;
  estimatedCost: number;
}

export interface EmbeddingOptions {
  maxRetries?: number;
  timeout?: number;
}

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;
const COST_PER_1K_TOKENS = 0.00002;

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openaiClient = new OpenAI({
      apiKey,
      maxRetries: 3,
      timeout: 30000,
    });
  }
  return openaiClient;
}

export async function generateEmbeddings(
  texts: string[],
  options: EmbeddingOptions = {},
): Promise<EmbeddingResult> {
  if (!texts || texts.length === 0) {
    throw new Error("texts array must not be empty");
  }

  const maxRetries = options.maxRetries ?? 3;
  const timeout = options.timeout ?? 30000;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const client = getClient();

      const response = await client.embeddings.create(
        {
          model: EMBEDDING_MODEL,
          input: texts,
          dimensions: EMBEDDING_DIMENSIONS,
          encoding_format: "float",
        },
        {
          timeout,
        },
      );

      const embeddings = response.data.map(
        (item: { embedding: number[] }) => item.embedding,
      );
      const tokensUsed = response.usage.total_tokens;
      const estimatedCost = (tokensUsed / 1000) * COST_PER_1K_TOKENS;

      return {
        embeddings,
        tokensUsed,
        estimatedCost,
      };
    } catch (err) {
      const errAsError = err instanceof Error ? err : new Error(String(err));
      lastError = errAsError;

      const apiError = err as any;
      if (apiError && typeof apiError === "object" && "status" in apiError) {
        if (apiError.status === 401) {
          throw new Error(
            "Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.",
          );
        }
        if (apiError.status === 429) {
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }
        if (apiError.status >= 500) {
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }
      }

      if (attempt === maxRetries - 1) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error("Failed to generate embeddings");
}

export async function generateSingleEmbedding(
  text: string,
  options?: EmbeddingOptions,
): Promise<number[]> {
  const result = await generateEmbeddings([text], options);
  return result.embeddings[0];
}

export function validateEmbeddingDimension(embedding: number[]): boolean {
  return embedding.length === EMBEDDING_DIMENSIONS;
}

export function calculateCost(tokens: number): number {
  return (tokens / 1000) * COST_PER_1K_TOKENS;
}

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS, COST_PER_1K_TOKENS };

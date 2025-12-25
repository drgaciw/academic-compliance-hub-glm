import { streamText } from "ai";
import type { AIConfig } from "./utils";

export interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface AISearchOptions {
  query: string;
  searchResults: SearchResult[];
  context?: string;
  onChunk?: (chunk: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export interface SourceCitation {
  url: string;
  title: string;
  excerpt: string;
}

export interface SearchResponse {
  answer: string;
  citations: SourceCitation[];
}

export async function streamAISearch(
  options: AISearchOptions,
  config: Partial<AIConfig> = {},
): Promise<SearchResponse> {
  const {
    query,
    searchResults,
    context = "",
    onChunk,
    onComplete,
    onError,
  } = options;

  if (searchResults.length === 0) {
    throw new Error("No search results found to process");
  }

  const contextText = searchResults
    .map(
      (result, idx) => `
[${idx + 1}] ${result.title}
URL: ${result.url}
Excerpt: ${result.excerpt}
Content: ${result.content}
`,
    )
    .join("\n");

  const prompt = `You are a helpful AI assistant answering questions based on provided documentation.

USER QUERY: ${query}

${context ? `ADDITIONAL CONTEXT: ${context}\n` : ""}
DOCUMENTATION:
${contextText}

TASK:
1. Provide a comprehensive answer to the user's question based on the documentation
2. Use specific information from the sources
3. If the documentation doesn't contain enough information, state this clearly
4. Format your response in a clear, readable way with appropriate headings and structure
5. Include source citations using [1], [2], etc. format to reference the documentation

Your response should be helpful, accurate, and directly address the user's question.`;

  try {
    const result = await streamText({
      model: (config.model as any) || "gpt-4",
      prompt,
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 2000,
    });

    let fullResponse = "";

    for await (const chunk of result.textStream) {
      fullResponse += chunk;
      onChunk?.(chunk);
    }

    onComplete?.();

    const citations: SourceCitation[] = searchResults.map((result) => ({
      url: result.url,
      title: result.title,
      excerpt: result.excerpt,
    }));

    return {
      answer: fullResponse,
      citations,
    };
  } catch (error) {
    onError?.(error as Error);
    throw error;
  }
}

export function extractCitationNumbers(answer: string): number[] {
  const citationRegex = /\[(\d+)\]/g;
  const citations: number[] = [];
  let match;

  while ((match = citationRegex.exec(answer)) !== null) {
    const num = parseInt(match[1], 10);
    if (!citations.includes(num)) {
      citations.push(num);
    }
  }

  return citations;
}

export function formatCitationsMarkdown(
  answer: string,
  citations: SourceCitation[],
): string {
  return answer.replace(/\[(\d+)\]/g, (match, num) => {
    const idx = parseInt(num, 10) - 1;
    if (idx >= 0 && idx < citations.length) {
      const citation = citations[idx];
      return `[[${citation.title}](${citation.url})]`;
    }
    return match;
  });
}

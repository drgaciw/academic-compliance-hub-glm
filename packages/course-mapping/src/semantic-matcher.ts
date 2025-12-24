import { generateSingleEmbedding } from "./embeddings";
import { vectorSearch, type VectorSearchResult } from "./vector";

export interface Course {
  id: string;
  code: string;
  name: string;
  description?: string;
  credits: number;
  subjectArea?: string;
  institutionId?: string;
}

export interface MatchResult {
  targetCourse: Course;
  similarityScore: number;
  confidence: number;
  subjectMatch: boolean;
  creditMatch: boolean;
  overallMatch: number;
}

export interface MatcherOptions {
  similarityThreshold?: number;
  confidenceThreshold?: number;
  considerSubjectArea?: boolean;
  considerCredits?: boolean;
  subjectWeight?: number;
  creditWeight?: number;
  maxResults?: number;
}

const DEFAULT_OPTIONS: MatcherOptions = {
  similarityThreshold: 0.75,
  confidenceThreshold: 0.7,
  considerSubjectArea: true,
  considerCredits: true,
  subjectWeight: 0.2,
  creditWeight: 0.15,
  maxResults: 5,
};

export async function findMatchingCourses(
  sourceCourse: Course,
  targetInstitutionId?: string,
  options: MatcherOptions = {},
): Promise<MatchResult[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const searchQuery = buildSearchQuery(sourceCourse);
  const queryEmbedding = await generateSingleEmbedding(searchQuery);

  let searchResults: VectorSearchResult[];
  if (targetInstitutionId) {
    searchResults = await vectorSearch(queryEmbedding, {
      limit: opts.maxResults,
      threshold: opts.similarityThreshold,
      filters: { institutionId: targetInstitutionId },
    });
  } else {
    searchResults = await vectorSearch(queryEmbedding, {
      limit: opts.maxResults,
      threshold: opts.similarityThreshold,
    });
  }

  const results: MatchResult[] = searchResults.map((result) => {
    const targetCourse = mapVectorResultToCourse(result);

    const subjectMatch = opts.considerSubjectArea
      ? checkSubjectMatch(sourceCourse, targetCourse)
      : true;

    const creditMatch = opts.considerCredits
      ? checkCreditMatch(sourceCourse, targetCourse)
      : true;

    const confidence = calculateConfidence(
      result.similarity,
      subjectMatch,
      creditMatch,
      opts.subjectWeight!,
      opts.creditWeight!,
    );

    return {
      targetCourse,
      similarityScore: result.similarity,
      confidence,
      subjectMatch,
      creditMatch,
      overallMatch: confidence,
    };
  });

  return results
    .filter((r) => r.confidence >= opts.confidenceThreshold!)
    .sort((a, b) => b.overallMatch - a.overallMatch);
}

function buildSearchQuery(course: Course): string {
  const parts = [course.code, course.name];

  if (course.description) {
    parts.push(course.description);
  }

  if (course.subjectArea) {
    parts.push(`Subject: ${course.subjectArea}`);
  }

  return parts.join(". ");
}

function mapVectorResultToCourse(result: VectorSearchResult): Course {
  return {
    id: result.id,
    code: result.code,
    name: result.name,
    credits: 0,
  };
}

function checkSubjectMatch(source: Course, target: Course): boolean {
  if (!source.subjectArea || !target.subjectArea) {
    return true;
  }

  const sourceArea = source.subjectArea.toUpperCase().trim();
  const targetArea = target.subjectArea.toUpperCase().trim();

  return sourceArea === targetArea;
}

function checkCreditMatch(source: Course, target: Course): boolean {
  if (!source.credits || !target.credits) {
    return true;
  }

  const diff = Math.abs(source.credits - target.credits);
  return diff <= 1;
}

function calculateConfidence(
  similarityScore: number,
  subjectMatch: boolean,
  creditMatch: boolean,
  subjectWeight: number,
  creditWeight: number,
): number {
  let confidence = similarityScore;

  if (subjectMatch) {
    confidence += subjectWeight * similarityScore;
  } else {
    confidence -= subjectWeight * similarityScore;
  }

  if (creditMatch) {
    confidence += creditWeight * similarityScore;
  } else {
    confidence -= creditWeight * similarityScore;
  }

  return Math.max(0, Math.min(1, confidence));
}

export async function matchCourseToCatalog(
  sourceCourse: Course,
  targetCourses: Course[],
  options: MatcherOptions = {},
): Promise<MatchResult[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!targetCourses || targetCourses.length === 0) {
    return [];
  }

  const searchQuery = buildSearchQuery(sourceCourse);
  const queryEmbedding = await generateSingleEmbedding(searchQuery);

  const results: MatchResult[] = [];

  for (const targetCourse of targetCourses) {
    const targetQuery = buildSearchQuery(targetCourse);
    const targetEmbedding = await generateSingleEmbedding(targetQuery);

    const similarityScore = cosineSimilarity(queryEmbedding, targetEmbedding);

    if (similarityScore < opts.similarityThreshold!) {
      continue;
    }

    const subjectMatch = opts.considerSubjectArea
      ? checkSubjectMatch(sourceCourse, targetCourse)
      : true;

    const creditMatch = opts.considerCredits
      ? checkCreditMatch(sourceCourse, targetCourse)
      : true;

    const confidence = calculateConfidence(
      similarityScore,
      subjectMatch,
      creditMatch,
      opts.subjectWeight!,
      opts.creditWeight!,
    );

    results.push({
      targetCourse,
      similarityScore,
      confidence,
      subjectMatch,
      creditMatch,
      overallMatch: confidence,
    });
  }

  return results
    .filter((r) => r.confidence >= opts.confidenceThreshold!)
    .sort((a, b) => b.overallMatch - a.overallMatch)
    .slice(0, opts.maxResults);
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);

  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

export function getBestMatch(matches: MatchResult[]): MatchResult | null {
  if (!matches || matches.length === 0) {
    return null;
  }

  return matches.reduce((best, current) =>
    current.overallMatch > best.overallMatch ? current : best,
  );
}

export function getConfidenceLevel(confidence: number): string {
  if (confidence >= 0.9) {
    return "VERY_HIGH";
  } else if (confidence >= 0.8) {
    return "HIGH";
  } else if (confidence >= 0.7) {
    return "MEDIUM";
  } else if (confidence >= 0.6) {
    return "LOW";
  } else {
    return "VERY_LOW";
  }
}

import { PrismaClient } from "@prisma/client";

export interface VectorSearchResult {
  id: string;
  code: string;
  name: string;
  similarity: number;
  metadata?: Record<string, any>;
}

export interface VectorSearchOptions {
  limit?: number;
  threshold?: number;
  filters?: Record<string, any>;
}

export async function vectorSearch(
  queryVector: number[],
  options: VectorSearchOptions = {},
): Promise<VectorSearchResult[]> {
  const { limit = 10, threshold = 0.7 } = options;

  if (queryVector.length !== 1536) {
    throw new Error(
      `Query vector must have 1536 dimensions, got ${queryVector.length}`,
    );
  }

  const prisma = new PrismaClient();

  try {
    const vectorString = `[${queryVector.join(",")}]`;

    const results = await prisma.$queryRaw<
      Array<{
        id: string;
        code: string;
        name: string;
        embedding: string;
        similarity: number;
      }>
    >`
      SELECT
        id,
        code,
        name,
        embedding,
        1 - (embedding <=> ${vectorString}::vector) as similarity
      FROM course_embeddings
      WHERE 1 - (embedding <=> ${vectorString}::vector) >= ${threshold}
      ORDER BY similarity DESC
      LIMIT ${limit}
    `;

    return results.map(
      (result: {
        id: string;
        code: string;
        name: string;
        embedding: string;
        similarity: number;
      }) => ({
        id: result.id,
        code: result.code,
        name: result.name,
        similarity: result.similarity,
      }),
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function insertCourseEmbedding(
  courseId: string,
  code: string,
  name: string,
  embedding: number[],
): Promise<void> {
  if (embedding.length !== 1536) {
    throw new Error(
      `Embedding must have 1536 dimensions, got ${embedding.length}`,
    );
  }

  const prisma = new PrismaClient();

  try {
    const vectorString = `[${embedding.join(",")}]`;

    await prisma.$executeRaw`
      INSERT INTO course_embeddings (id, code, name, embedding, created_at, updated_at)
      VALUES (${courseId}, ${code}, ${name}, ${vectorString}::vector, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        code = EXCLUDED.code,
        name = EXCLUDED.name,
        embedding = EXCLUDED.embedding,
        updated_at = NOW()
    `;
  } finally {
    await prisma.$disconnect();
  }
}

export async function batchInsertEmbeddings(
  embeddings: Array<{
    courseId: string;
    code: string;
    name: string;
    embedding: number[];
  }>,
): Promise<void> {
  const prisma = new PrismaClient();

  try {
    for (const item of embeddings) {
      await insertCourseEmbedding(
        item.courseId,
        item.code,
        item.name,
        item.embedding,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteCourseEmbedding(courseId: string): Promise<void> {
  const prisma = new PrismaClient();

  try {
    await prisma.$executeRaw`
      DELETE FROM course_embeddings
      WHERE id = ${courseId}
    `;
  } finally {
    await prisma.$disconnect();
  }
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

export function euclideanDistance(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let sumSquaredDiff = 0;

  for (let i = 0; i < vecA.length; i++) {
    const diff = vecA[i] - vecB[i];
    sumSquaredDiff += diff * diff;
  }

  return Math.sqrt(sumSquaredDiff);
}

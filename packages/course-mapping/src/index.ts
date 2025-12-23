export {
  generateEmbeddings,
  generateSingleEmbedding,
  validateEmbeddingDimension,
  calculateCost,
  type EmbeddingResult,
  type EmbeddingOptions,
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
  COST_PER_1K_TOKENS,
} from "./embeddings";

export {
  vectorSearch,
  insertCourseEmbedding,
  batchInsertEmbeddings,
  deleteCourseEmbedding,
  cosineSimilarity,
  euclideanDistance,
  type VectorSearchResult,
  type VectorSearchOptions,
} from "./vector";

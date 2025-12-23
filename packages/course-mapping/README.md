# @aah/course-mapping

Course mapping and embedding generation package for transfer credit evaluation using OpenAI's text-embedding-3-small model.

## Features

- Batch text embedding generation with OpenAI API
- 1536-dimensional vector support
- Error handling and automatic retries
- Token usage tracking for cost monitoring
- pgvector integration for similarity search

## Usage

```typescript
import { generateEmbeddings, vectorSearch } from "@aah/course-mapping";

// Generate embeddings for batch texts
const texts = [
  "Introduction to Computer Science",
  "Data Structures and Algorithms",
  "Database Systems",
];

const result = await generateEmbeddings(texts);

console.log(result.embeddings); // Array of 1536-dimensional vectors
console.log(result.tokensUsed); // Total tokens used
console.log(result.estimatedCost); // Estimated cost in USD
```

## Configuration

Requires `OPENAI_API_KEY` environment variable.

# @aah/ai

AI utilities and agents using Vercel AI SDK for Athletic Academics Hub.

## Overview

This package provides AI-powered features for academic advising, compliance checking, and student support.

## Features

- NCAA compliance analysis agents
- Academic course recommendations
- Performance analysis tools
- Streaming AI responses with progress tracking
- Prompt templates for common AI tasks
- Rate limiting for AI endpoints

## Usage

### Streaming with Progress Tracking

```typescript
import { streamTextWithProgress } from "@aah/ai";

const text = await streamTextWithProgress(
  "Analyze this data...",
  (chunk) => console.log(chunk),
  (progress) =>
    console.log(
      `Progress: ${progress.currentChunk} chunks, ${progress.totalLength} chars`,
    ),
  {
    model: "gpt-4",
    temperature: 0.7,
    onStart: () => console.log("Starting..."),
    onComplete: () => console.log("Complete!"),
  },
);
```

### Prompt Templates

```typescript
import { buildPrompt } from "@aah/ai";

const prompt = buildPrompt(
  "courseRecommendation",
  {
    completedCourses: [
      { code: "MATH101", name: "Calculus", credits: 4, grade: "A" },
    ],
    currentGPA: 3.5,
    totalCredits: 60,
    requiredCredits: 120,
  },
  { sport: "Basketball", division: "I" },
);
```

### Rate Limiting

```typescript
import { checkAIRateLimit, createRateLimiterMiddleware } from "@aah/ai";

const result = await checkAIRateLimit("user-123");
if (!result.allowed) {
  console.log(`Rate limited. Retry after ${result.retryAfter}s`);
}

const middleware = createRateLimiterMiddleware({
  keyGenerator: (req) => req.headers.get("x-user-id") ?? "anonymous",
  onLimitReached: (id, resetTime) =>
    console.log(`${id} limited until ${resetTime}`),
});
```

### Check NCAA Compliance

```typescript
import { checkNCAACompliance } from "@aah/ai";

const compliance = await checkNCAACompliance({
  studentId: "stu-123",
  sport: "Basketball",
  academicYear: 2,
});
```

### Get Course Recommendations

```typescript
import { getCourseRecommendations } from "@aah/ai";

const recommendations = await getCourseRecommendations({
  studentId: "stu-123",
  currentGPA: 3.2,
  completedCredits: 45,
  targetCredits: 120,
});
```

## AI Models

Uses Vercel AI SDK with support for:

- OpenAI GPT-4
- Custom model configurations
- Streaming responses

## Rate Limiting

Default rate limit: **10 requests per minute** per identifier.

Configure custom limits:

```typescript
import { RateLimiter } from "@aah/ai";

const limiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
});
```

## Prompt Templates

Available prompt templates:

- `courseRecommendation`: Academic course recommendations based on performance
- `complianceAnalysis`: NCAA compliance eligibility analysis
- `transferCreditEvaluation`: Transfer credit evaluation
- `academicPerformanceInsight`: Performance insights and recommendations
- `eligibilityChecklist`: Compliance checklist generation

## Configuration

Set the following environment variables:

- `OPENAI_API_KEY` - OpenAI API key
- `AI_MODEL` - Default AI model (optional)

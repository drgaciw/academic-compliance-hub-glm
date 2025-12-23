# @aah/ai

AI utilities and agents using Vercel AI SDK for Athletic Academics Hub.

## Overview

This package provides AI-powered features for academic advising, compliance checking, and student support.

## Features

- NCAA compliance analysis agents
- Academic course recommendations
- Performance analysis tools
- Streaming AI responses

## Usage

```typescript
import { checkNCAACompliance, getCourseRecommendations } from '@aah/ai';

// Check NCAA compliance
const compliance = await checkNCAACompliance({
  studentId: 'stu-123',
  sport: 'Basketball',
  academicYear: 2,
});

// Get course recommendations
const recommendations = await getCourseRecommendations({
  studentId: 'stu-123',
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

## Configuration

Set the following environment variables:

- `OPENAI_API_KEY` - OpenAI API key
- `AI_MODEL` - Default AI model (optional)

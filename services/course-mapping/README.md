# @aah/service-course-mapping

Course mapping microservice for transfer credit evaluation.

## Features

- CRUD operations for course mappings
- Search endpoints for finding matches by course code, title, institution
- Semantic similarity search using OpenAI embeddings
- Confidence scoring based on semantic similarity, subject area match, and credits match
- Batch import/export capabilities
- Manual verification workflow
- Institution-based filtering

## Endpoints

### Health Check

- `GET /health` - Service health check

### Course Mapping CRUD

- `POST /api/course-mappings` - Create new mapping
- `GET /api/course-mappings/:id` - Get mapping by ID
- `PUT /api/course-mappings/:id` - Update mapping
- `DELETE /api/course-mappings/:id` - Delete mapping

### Search & Discovery

- `GET /api/course-mappings/search` - Search by source code, title, institution, status
- `GET /api/course-mappings/similar/:text` - Semantic similarity search
- `GET /api/course-mappings/institutions/:id` - Get mappings by institution

### Verification & Bulk Operations

- `POST /api/course-mappings/verify/:id` - Manual verification
- `POST /api/course-mappings/approve-batch` - Approve multiple mappings
- `POST /api/course-mappings/batch-import` - Import CSV/batch of mappings

### Confidence Scoring

- `GET /api/course-mappings/:id/confidence` - Get detailed confidence breakdown

## Usage

### Create a Mapping

```bash
POST /api/course-mappings
Content-Type: application/json

{
  "transferEvaluationId": "transfer-eval-id",
  "sourceInstitutionId": "source-inst-id",
  "sourceCourseCode": "CS101",
  "sourceCourseTitle": "Introduction to Computer Science",
  "sourceCredits": 3,
  "sourceSubjectArea": "COMPUTER_SCIENCE",
  "targetCourseCode": "CSCI100",
  "targetCourseTitle": "Intro to Computing",
  "targetCredits": 3,
  "targetSubjectArea": "COMPUTER_SCIENCE",
  "isEquivalent": true,
  "confidenceScore": 0.95
}
```

### Search Mappings

```bash
GET /api/course-mappings/search?sourceCode=CS101&sourceInstitutionId=inst-id&page=1&pageSize=20
```

### Semantic Similarity Search

```bash
GET /api/course-mappings/similar/Introduction%20to%20Computer%20Science?limit=10&threshold=0.7
```

### Verify Mapping

```bash
POST /api/course-mappings/{id}/verify
Content-Type: application/json

{
  "verificationStatus": "APPROVED",
  "verificationNotes": "Reviewed and verified by advisor"
}
```

### Batch Import

```bash
POST /api/course-mappings/batch-import
Content-Type: application/json

{
  "mappings": [
    {
      "transferEvaluationId": "eval-1",
      "sourceInstitutionId": "inst-1",
      "sourceCourseCode": "CS101",
      "sourceCourseTitle": "Intro to CS",
      "sourceCredits": 3,
      "sourceSubjectArea": "COMPUTER_SCIENCE",
      "targetCourseCode": "CSCI100",
      "targetCourseTitle": "Intro to Computing",
      "targetCredits": 3,
      "targetSubjectArea": "COMPUTER_SCIENCE",
      "isEquivalent": true
    }
  ]
}
```

## Dependencies

- `@aah/database` - Prisma client and database models
- `@aah/api-utils` - Response formatting utilities
- `@aah/course-mapping` - Embedding generation and vector search
- `hono` - Fast web framework
- `zod` - Schema validation

## Environment Variables

- `DATABASE_URL` - PostgreSQL database connection string
- `OPENAI_API_KEY` - OpenAI API key for embedding generation

## Development

```bash
pnpm install
pnpm dev
```

## Testing

```bash
pnpm test
```

## Building

```bash
pnpm build
```

# OCR Pipeline Service

## Overview

The OCR (Optical Character Recognition) Pipeline Service provides comprehensive document text extraction capabilities with advanced retry logic, error handling, and queue management for processing documents at scale.

## Features

### 1. Multi-Stage OCR Processing

- **Preprocessing**: Image enhancement using Sharp (grayscale conversion, normalization, sharpening)
- **OCR Execution**: Text extraction using Tesseract.js with configurable language support
- **Post-processing**: Confidence filtering, field extraction, and result normalization
- **PDF Support**: Multi-page PDF processing with page-level results

### 2. Retry Logic

- **Exponential Backoff**: Automatic retry with increasing delays
  - Initial delay: 100ms
  - Maximum delay: 5s
  - Multiplier: 2x per attempt
  - Max attempts: 3

- **Error Classification**:
  - `transient`: Network timeouts, rate limits, temporary unavailability
  - `permanent`: Invalid formats, corrupted files, validation errors
  - `validation`: Unknown or ambiguous errors

### 3. Circuit Breaker

- Prevents cascading failures by blocking requests after repeated failures
- Configurable threshold (default: 5 failures)
- Automatic timeout and half-open state for recovery
- Manual reset capability via API

### 4. Batch Processing Queue

- **Job Prioritization**:
  - `high`: Priority 1
  - `normal`: Priority 2
  - `low`: Priority 3

- **Worker Pool**:
  - Max concurrent jobs: 5 (configurable)
  - Automatic job scheduling based on priority
  - Status tracking for each job

- **Dead Letter Queue**: Permanently failed jobs stored for manual review and retry

### 5. Monitoring & Metrics

Real-time metrics available via API:

- Queue status (pending, processing, completed, failed, retrying)
- Performance metrics (average processing time, success rate)
- Circuit breaker state
- Dead letter queue size

## Installation

```bash
cd services/document-ingestion
pnpm install
```

## Configuration

```typescript
OCRPipeline.configure({
  retryConfig: {
    initialDelay: 100, // Initial delay in ms
    maxDelay: 5000, // Maximum delay in ms
    maxAttempts: 3, // Maximum retry attempts
    backoffMultiplier: 2, // Exponential multiplier
  },
  maxConcurrentJobs: 5, // Maximum parallel jobs
  priorityValues: {
    high: 1,
    normal: 2,
    low: 3,
  },
});
```

## API Usage

### Synchronous OCR Processing

```typescript
const result = await OCRPipeline.processDocument({
  documentId: "doc_123",
  fileBuffer: Buffer.from(documentData),
  fileType: "pdf",
  timeout: 30000,
});

if (result.success) {
  console.log("Extracted text:", result.text);
  console.log("Confidence:", result.confidence);
  console.log("Fields:", result.fields);
}
```

### Asynchronous Queue Processing

```typescript
// Queue a job
const queueResult = await OCRPipeline.queueJob({
  documentId: "doc_123",
  fileBuffer: Buffer.from(documentData),
  fileType: "pdf",
  priority: "high",
});

if (queueResult.success) {
  // Process the queue
  await OCRPipeline.processQueue();
}
```

### HTTP API Endpoints

#### Upload with OCR

```
POST /documents/upload
Content-Type: multipart/form-data

Parameters:
- file: Document file
- asyncOcr: "true" for async processing

Response:
{
  "success": true,
  "documentId": "doc_123",
  "metadata": {
    "fileName": "transcript.pdf",
    "fileType": "pdf",
    "ocrData": {
      "text": "extracted text",
      "confidence": 95,
      "processingTime": 1500
    }
  }
}
```

#### Queue OCR Job

```
POST /documents/process-ocr
Content-Type: application/json

Body:
{
  "documentId": "doc_123",
  "priority": "high"
}
```

#### Get Queue Metrics

```
GET /documents/queue/metrics

Response:
{
  "success": true,
  "metrics": {
    "pending": 5,
    "processing": 2,
    "completed": 100,
    "failed": 3,
    "retrying": 1,
    "totalProcessed": 104,
    "averageProcessingTime": 1250,
    "successRate": 97.1
  }
}
```

#### Get Dead Letter Queue

```
GET /documents/queue/dead-letter

Response:
{
  "success": true,
  "jobs": [
    {
      "id": "job_123",
      "documentId": "doc_456",
      "attempts": 3,
      "status": "failed",
      "error": "Invalid file format",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Retry Dead Letter Job

```
POST /documents/queue/retry/:jobId

Response:
{
  "success": true,
  "message": "Job requeued successfully",
  "jobId": "job_123"
}
```

#### Clear Dead Letter Queue

```
POST /documents/queue/clear-dead-letter

Response:
{
  "success": true,
  "message": "Dead letter queue cleared successfully"
}
```

#### Reset Circuit Breaker

```
POST /documents/queue/circuit-breaker/reset

Response:
{
  "success": true,
  "message": "Circuit breaker reset successfully"
}
```

## Data Structures

### OCRResult

```typescript
interface OCRResult {
  success: boolean;
  documentId: string;
  text: string;
  confidence: number;
  fields?: ExtractedFields;
  pages?: PageResult[];
  metadata: OCRMetadata;
  error?: string;
}
```

### ExtractedFields

```typescript
interface ExtractedFields {
  studentName?: string;
  studentId?: string;
  gpa?: number;
  cumulativeCredits?: number;
  term?: string;
  courses?: CourseInfo[];
  institutionName?: string;
}
```

### CourseInfo

```typescript
interface CourseInfo {
  code?: string;
  name?: string;
  credits?: number;
  grade?: string;
  term?: string;
}
```

## Error Handling

### Transient Errors

Automatically retried with exponential backoff:

- Network timeouts
- Connection errors
- Rate limits (503 errors)
- Service unavailability

### Permanent Errors

Moved to dead letter queue for manual review:

- Invalid file formats
- Corrupted files
- Validation errors
- Unauthorized access

### Validation Errors

Typically require manual intervention.

## Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## Performance Optimization

### Batch Processing

For large volumes of documents:

1. Queue jobs with appropriate priorities
2. Configure `maxConcurrentJobs` based on available resources
3. Monitor queue metrics to adjust settings

### Memory Management

- Image preprocessing buffers are released after processing
- Dead letter queue should be periodically cleared
- Processing times are tracked with a rolling window (last 100 jobs)

### Alert Thresholds

Monitor these metrics for alerts:

- `successRate` < 90%: Check circuit breaker state
- `averageProcessingTime` > 10000ms: May need optimization
- `deadLetterQueue` size > 10: Review failed jobs

## Dependencies

- **tesseract.js**: OCR engine for text extraction
- **sharp**: High-performance image processing
- **pdfjs-dist**: PDF rendering and processing
- **hono**: Web framework for API endpoints

## Security Considerations

- Document buffers are kept in memory only during processing
- Dead letter queue may contain sensitive data - implement proper access controls
- Rate limiting recommended for public-facing endpoints
- Consider encrypting sensitive extracted fields in production

## Troubleshooting

### OCR Returns Low Confidence

- Check image quality (resolution, contrast)
- Verify document type is supported (pdf, jpeg, png)
- Review preprocessing settings

### Jobs Stuck in Processing

- Check circuit breaker state
- Verify worker availability
- Review logs for uncaught exceptions

### Dead Letter Queue Growing

- Review error types for common patterns
- Consider adjusting retry configuration
- Implement automatic cleanup policies

## Future Enhancements

- [ ] Add support for additional languages
- [ ] Implement Redis/Vercel KV for distributed queue
- [ ] Add WebSocket support for real-time job updates
- [ ] Implement document templates for better field extraction
- [ ] Add machine learning-based document classification
- [ ] Support for scanned handwriting recognition

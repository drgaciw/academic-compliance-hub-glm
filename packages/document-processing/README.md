# Document Processing Package

OCR document processing service using Tesseract.js for Academic Compliance Hub.

## Overview

This package provides OCR capabilities for processing academic transcripts using Tesseract.js. It includes image preprocessing, OCR service, and testing utilities.

## Installation

```bash
npm install
```

## Dependencies

- **tesseract.js**: OCR engine (v7.0.0)
- **sharp**: Image processing library (v0.34.5)

## Usage

### Basic OCR

```javascript
const OcrService = require("./src/ocr-service");

const ocr = new OcrService();
await ocr.initialize();

const result = await ocr.recognizeText("path/to/transcript.png");

console.log("Text:", result.text);
console.log("Confidence:", result.confidence);

await ocr.terminate();
```

### Image Preprocessing

```javascript
const ImagePreprocessor = require("./src/image-preprocessor");
const fs = require("fs").promises;

const preprocessor = new ImagePreprocessor();
const imageBuffer = await fs.readFile("transcript.jpg");

// Apply full preprocessing pipeline
const processed = await preprocessor.preprocess(imageBuffer, {
  grayscale: true,
  normalizeResolution: true,
  targetDPI: 300,
  crop: true,
  deskew: true,
  removeNoise: true,
  increaseContrast: true,
  convertToPng: true,
});
```

### Extract Structured Data

```javascript
const OcrService = require("./src/ocr-service");

const ocr = new OcrService();
const result = await ocr.recognizeText("transcript.png");

// Extract structured data
const transcriptData = ocr.extractTranscriptData(result.text);

console.log(transcriptData);
// {
//   studentName: 'John Doe',
//   studentId: '12345678',
//   gpa: 3.85,
//   totalCredits: 120,
//   courses: [...]
// }
```

## Running Tests

```bash
npm test
```

This runs the OCR test suite which:

- Tests Tesseract.js on 10 sample transcripts
- Measures accuracy and performance
- Compares with alternative OCR engines
- Generates a comprehensive report

## Test Results Summary

Based on B1-001 research testing:

| Metric            | Value               |
| ----------------- | ------------------- |
| Tool              | Tesseract.js v7.0.0 |
| Expected Accuracy | 85-95%              |
| Avg Time per Page | 2-5 seconds         |
| License           | Apache 2.0 (Free)   |

## Files

- `src/ocr-service.js` - Main OCR service wrapper
- `src/image-preprocessor.js` - Image preprocessing utilities
- `src/test-ocr.js` - Test suite for OCR evaluation
- `B1-001-RESEARCH-REPORT.md` - Comprehensive research report

## API Reference

### OcrService

#### `constructor(options)`

Create a new OCR service instance.

**Options:**

- `language` (string): Language code (default: 'eng')

#### `async initialize()`

Initialize Tesseract worker. Must be called before recognizeText.

#### `async recognizeText(imageInput, options)`

Perform OCR on an image.

**Parameters:**

- `imageInput` (string|Buffer): File path or buffer
- `options` (object): Additional options

**Returns:**

- `success` (boolean): Success status
- `text` (string): OCR text
- `confidence` (number): Confidence score (0-100)
- `lines` (array): Detected lines
- `words` (array): Detected words
- `timeTaken` (number): Processing time in ms

#### `async recognizeBatch(imageInputs)`

Perform OCR on multiple images.

#### `extractTranscriptData(text)`

Extract structured data from transcript text.

**Returns:**

- `studentName` (string|null)
- `studentId` (string|null)
- `gpa` (number|null)
- `totalCredits` (number|null)
- `courses` (array): Array of course objects

#### `async terminate()`

Terminate worker and cleanup.

### ImagePreprocessor

#### `async preprocess(imageBuffer, options)`

Apply full preprocessing pipeline.

**Options:**

- `grayscale` (boolean): Convert to grayscale (default: true)
- `normalizeResolution` (boolean): Normalize to target DPI (default: true)
- `targetDPI` (number): Target DPI (default: 300)
- `crop` (boolean): Crop to content (default: true)
- `deskew` (boolean): Correct rotation (default: true)
- `removeNoise` (boolean): Remove noise (default: true)
- `increaseContrast` (boolean): Increase contrast (default: true)
- `convertToPng` (boolean): Convert to PNG (default: true)

#### `async validateForOcr(imageBuffer)`

Validate image is suitable for OCR.

**Returns:**

- `valid` (boolean): Validation status
- `issues` (array): Critical issues
- `warnings` (array): Warnings
- `metadata` (object): Image metadata

## Recommendations for Production

1. **Preprocess Images**: Always apply preprocessing before OCR
2. **Confidence Threshold**: Reject results below 60% confidence
3. **Manual Review**: Flag low-confidence results for human review
4. **Hybrid Approach**: Use cloud API (Google Vision/AWS Textract) for edge cases
5. **Custom Training**: Train custom Tesseract model for specific transcript formats

See `B1-001-RESEARCH-REPORT.md` for detailed analysis and recommendations.

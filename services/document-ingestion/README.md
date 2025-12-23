# Document Ingestion Service

Handles document upload, processing, and classification for the Athletic Academics Hub.

## Features

- Document upload with multipart form handling
- File type validation (PDF, JPEG, PNG, EDI)
- File size limits (50MB)
- Virus scanning integration
- Document classification and metadata extraction
- Storage in Vercel Blob

## Endpoints

- `GET /health` - Health check
- `POST /documents/upload` - Upload documents

## Development

```bash
npm install
npm run dev
```

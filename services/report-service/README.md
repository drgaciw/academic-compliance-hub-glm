# Report Service

Report generation microservice with PDF generation, digital signatures, and export functionality.

## Features

- **Report Generation**: Generate NCAA compliance, transfer credit, and custom reports
- **PDF Generation**: High-quality PDF reports using jsPDF and Handlebars
- **Digital Signatures**: Sign reports with certificate-based digital signatures
- **Job Queue**: Async report generation with Bull queue and Redis
- **Batch Processing**: Generate multiple reports in parallel
- **Template Management**: Create and manage custom report templates
- **Export Options**: Export reports in PDF, CSV, and JSON formats
- **Real-time Updates**: WebSocket support for progress updates
- **Auto-cleanup**: Automatic expiration and cleanup of old reports

## API Endpoints

### Report Generation

- `POST /api/reports/eligibility` - Generate NCAA compliance report
- `POST /api/reports/transfer-credit` - Generate transfer credit report
- `POST /api/reports/batch` - Generate batch reports
- `GET /api/reports/:id` - Get report status
- `GET /api/reports/:id/download` - Download generated report

### Template Management

- `GET /api/reports/templates` - List available templates
- `POST /api/reports/templates` - Create custom template

### Digital Signatures

- `POST /api/reports/:id/sign` - Apply digital signature to report

### Report Management

- `DELETE /api/reports/:id` - Delete report

### Export

- `GET /api/reports/export/csv` - CSV export endpoint
- `GET /api/reports/export/json` - JSON export endpoint

### Queue & Worker

- `GET /api/reports/stats/queue` - Get queue statistics
- `POST /api/reports/worker/start` - Start report worker

### WebSocket

- `WS /ws/reports` - Real-time report progress updates

## Installation

```bash
cd services/report-service
pnpm install
```

## Environment Variables

```env
PORT=3004
HOST=0.0.0.0
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://...
REPORTS_DIR=./reports
START_WORKER=true
```

## Usage

### Start the Service

```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start

# Start with worker
START_WORKER=true pnpm start
```

### Generate Eligibility Report

```bash
curl -X POST http://localhost:3004/api/reports/eligibility \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -d '{
    "studentName": "John Doe",
    "studentId": "STU001",
    "sport": "Basketball",
    "division": "Division I",
    "coreGPA": 3.5,
    "testScore": "ACT 24",
    "initialEligibility": "Full Qualifier",
    "currentGPA": 3.4,
    "creditsThisTerm": 12,
    "cumulativeCredits": 45,
    "aprProgress": 975,
    "minCredits": 24,
    "currentCredits": 12,
    "enrollmentStatus": "Full-time",
    "creditsCompleted": 45,
    "sixHourRule": true,
    "requirements": [
      {
        "name": "Core Course GPA",
        "value": 3.5,
        "required": 2.3,
        "status": "PASS"
      }
    ],
    "eligibilityStatus": "ELIGIBLE"
  }'
```

### Generate Transfer Credit Report

```bash
curl -X POST http://localhost:3004/api/reports/transfer-credit \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -d '{
    "studentName": "Jane Smith",
    "studentId": "STU002",
    "previousInstitution": "Community College",
    "transferDate": "2024-01-01",
    "courses": [
      {
        "courseCode": "MATH101",
        "courseTitle": "Calculus I",
        "credits": 3,
        "grade": "A",
        "term": "Fall 2023"
      }
    ],
    "totalCredits": 3,
    "transferGPA": 4.0,
    "creditsRequired": 120,
    "creditsEarned": 3,
    "progressPercentage": 2.5
  }'
```

### Check Report Status

```bash
curl http://localhost:3004/api/reports/{reportId}
```

### Download Report

```bash
curl http://localhost:3004/api/reports/{reportId}/download \
  --output report.pdf
```

### Sign Report

```bash
curl -X POST http://localhost:3004/api/reports/{reportId}/sign \
  -H "Content-Type: application/json" \
  -d '{
    "signerName": "John Advisor",
    "signerTitle": "Academic Advisor",
    "signature": "base64-encoded-signature",
    "signatureDate": "2024-01-15T10:00:00Z",
    "certificateInfo": {
      "serialNumber": "12345",
      "issuer": "University Certificate Authority",
      "validFrom": "2024-01-01T00:00:00Z",
      "validTo": "2025-01-01T00:00:00Z",
      "subject": "John Advisor",
      "certificateHash": "abc123"
    }
  }'
```

### Batch Reports

```bash
curl -X POST http://localhost:3004/api/reports/batch \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -d '{
    "reportType": "eligibility",
    "studentIds": ["STU001", "STU002", "STU003"],
    "format": "pdf"
  }'
```

### Export Reports

```bash
# CSV Export
curl http://localhost:3004/api/reports/export/csv \
  --output reports.csv

# JSON Export
curl http://localhost:3004/api/reports/export/json?type=eligibility
```

### WebSocket Connection

```javascript
const ws = new WebSocket("ws://localhost:3004/ws/reports?clientId=user123");

ws.onopen = () => {
  ws.send(JSON.stringify({ type: "subscribe" }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log("Update:", message);
};
```

## Report Expiration

Reports automatically expire after 30 days. The cleanup job runs daily at 2 AM.

## Testing

```bash
pnpm test
```

## Dependencies

- **Hono**: Fast web framework
- **Bull**: Job queue for Redis
- **jsPDF**: PDF generation
- **Handlebars**: Template engine
- **PapaParse**: CSV parsing
- **node-signpdf**: Digital signatures
- **ws**: WebSocket support
- **node-cron**: Scheduled jobs

## Database Schema

Uses `ReportMetadata` and `ReportTemplate` models from Prisma schema.

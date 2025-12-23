# Mock Servers for Integration Testing

This directory contains mock servers for testing external system integrations.

## Available Mock Servers

### 1. Banner Mock (Port 3101)

- `GET /students/:id` - Get student information
- `GET /students/:id/transcript` - Get student transcript
- `POST /evaluations` - Submit evaluation
- `POST /webhook` - Register webhook for notifications
- `GET /evaluations` - Get all evaluations
- `GET /health` - Health check

### 2. PeopleSoft Mock (Port 3102)

Same endpoints as Banner Mock

### 3. Colleague Mock (Port 3103)

Same endpoints as Banner Mock

### 4. Custom REST Mock (Port 3104)

Configurable mock server:

- `GET /config/endpoints` - Get configured endpoints
- `POST /config/endpoints` - Add custom endpoint
- `GET /students/:id` - Default student endpoint
- `GET /students/:id/transcript` - Default transcript endpoint
- `POST /evaluations` - Submit evaluation
- `POST /webhook` - Register webhook
- `GET /evaluations` - Get all evaluations
- `GET /health` - Health check

### 5. SFTP Mock (Port 3105)

- `POST /upload` - Upload file (simulates SFTP upload)
- `GET /files` - List all files
- `GET /files/:filename` - Get file details
- `DELETE /files/:filename` - Delete file
- `POST /download` - Download file
- `POST /webhook` - Register webhook
- `GET /health` - Health check

## Starting the Mock Servers

### Start All Mock Servers

```bash
npm run start:all
```

### Start Individual Mock Servers

```bash
npm run start:banner      # Banner Mock (3101)
npm run start:peoplesoft  # PeopleSoft Mock (3102)
npm run start:colleague   # Colleague Mock (3103)
npm run start:custom      # Custom REST Mock (3104)
npm run start:sftp        # SFTP Mock (3105)
```

### From Root Directory

```bash
npm run test:mocks           # Start all mocks
npm run test:mock:banner     # Start Banner only
npm run test:mock:peoplesoft # Start PeopleSoft only
npm run test:mock:colleague  # Start Colleague only
npm run test:mock:custom     # Start Custom REST only
npm run test:mock:sftp       # Start SFTP only
```

## Sample Data

### Students

- `12345` - John Doe (Computer Science)
- `67890` - Jane Smith (varies by system)

### Sample Transcript Data

Each mock server returns sample transcript data with:

- GPA (varies by system: 3.75-3.82)
- Total credits (varies by system: 118-124)
- 4 sample courses with grades
- Academic standing

## Webhook Support

All mock servers support webhook registration via:

```bash
POST /webhook
{ "url": "http://your-webhook-endpoint" }
```

Webhooks are triggered when:

- Evaluations are submitted
- Files are uploaded (SFTP mock)

## Testing

### Using curl

```bash
# Get student info
curl http://localhost:3101/students/12345

# Get transcript
curl http://localhost:3101/students/12345/transcript

# Submit evaluation
curl -X POST http://localhost:3101/evaluations \
  -H "Content-Type: application/json" \
  -d '{"studentId": "12345", "courses": [...] }'

# Register webhook
curl -X POST http://localhost:3101/webhook \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:4000/webhook"}'
```

## Cleanup

```bash
npm run clean
```

This removes the `dist` directory and `mock-sftp-uploads` directory.

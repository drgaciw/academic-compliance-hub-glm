# Eligibility Engine Microservice

The eligibility-engine microservice provides comprehensive academic eligibility evaluation for student-athletes, including GPA calculation, transfer credit evaluation, progress toward degree assessment, and what-if scenario modeling.

## Features

- **Full Eligibility Evaluation**: Complete NCAA eligibility assessment
- **GPA Calculation**: Institutional, transfer, and cumulative GPA
- **Progress Toward Degree**: Degree completion tracking
- **What-If Scenarios**: Project eligibility based on assumptions
- **Transfer Credit Evaluation**: Assess transfer credit eligibility
- **Manual Overrides**: Compliance officer overrides with justification

## Endpoints

### POST /api/eligibility/evaluate

Perform full eligibility evaluation for a student.

**Request Body:**

```json
{
  "studentId": "string",
  "season": "string (optional)",
  "sport": "string (optional)",
  "term": "string (optional)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "studentId": "string",
    "eligible": boolean,
    "evaluatedAt": "ISO8601",
    "results": [...],
    "violations": [...]
  }
}
```

### GET /api/eligibility/:studentId

Get current eligibility status for a student.

**Response:**

```json
{
  "success": true,
  "data": {
    "studentId": "string",
    "eligible": boolean,
    "lastEvaluated": "ISO8601",
    "currentGPA": number,
    "earnedCredits": number,
    "transferCredits": number,
    "totalCredits": number,
    "violations": [...]
  }
}
```

### POST /api/eligibility/gpa

Calculate GPA with various options.

**Request Body:**

```json
{
  "studentId": "string",
  "courses": [
    {
      "courseId": "string",
      "credits": number,
      "grade": "string | number",
      "isPassFail": boolean
    }
  ],
  "includeTransfer": boolean,
  "includePassFail": boolean
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "result": { "gpa": number, "qualityPoints": number, "totalCredits": number },
    "breakdown": {
      "institutional": {...},
      "transfer": {...},
      "cumulative": {...}
    }
  }
}
```

### POST /api/eligibility/progress-toward-degree

Calculate progress toward degree completion.

**Request Body:**

```json
{
  "studentId": "string",
  "degreeProgram": "string (optional)",
  "includeTransferCredits": boolean
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "progress": {
      "percentageComplete": number,
      "requiredPercentage": number,
      "totalDegreeCredits": number,
      "creditsEarned": number
    },
    "breakdown": {
      "institutional": number,
      "transfer": number,
      "totalEarned": number,
      "inProgress": number
    },
    "termProgress": [...]
  }
}
```

### POST /api/eligibility/what-if

Run what-if scenario modeling.

**Request Body:**

```json
{
  "studentId": "string",
  "scenarioName": "string",
  "assumptions": {
    "projectedGrades": [...],
    "additionalCourses": [...],
    "repeatCourses": ["string"],
    "creditsToComplete": number,
    "targetGPA": number
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "scenarioName": "string",
    "projected": {
      "gpa": number,
      "credits": number,
      "eligibilityStatus": "eligible | ineligible | conditional",
      "violations": [...]
    },
    "comparison": {...},
    "recommendations": [...]
  }
}
```

### GET /api/eligibility/rules

List all available eligibility rules.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalRules": number,
    "rules": [
      {
        "ruleId": "string",
        "version": "string",
        "enabled": boolean,
        "parameters": {...}
      }
    ]
  }
}
```

### POST /api/eligibility/override

Create manual eligibility override.

**Request Body:**

```json
{
  "studentId": "string",
  "ruleId": "string",
  "override": boolean,
  "justification": "string",
  "approvedBy": "string (optional)",
  "effectiveUntil": "ISO8601 (optional)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "studentId": "string",
    "ruleId": "string",
    "override": boolean,
    "justification": "string",
    "approvedBy": "string",
    "status": "active | expired | revoked",
    "createdAt": "ISO8601"
  }
}
```

### GET /api/eligibility/violations/:studentId

Get all eligibility violations for a student.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "studentId": "string",
      "ruleId": "string",
      "ruleName": "string",
      "bylawReference": "string",
      "severity": "critical | major | minor",
      "currentValue": number,
      "requiredValue": number,
      "remediation": [...],
      "status": "active | waived | resolved"
    }
  ]
}
```

## Architecture

### Services

- **EvaluationService**: Full eligibility evaluation using compliance-engine rules
- **GPAService**: GPA calculation with institutional/transfer breakdown
- **PTDService**: Progress toward degree calculation
- **WhatIfService**: Scenario modeling and comparison
- **TransferService**: Transfer credit evaluation
- **OverrideService**: Manual override management

### Dependencies

- `@aah/database`: Prisma database access
- `@aah/compliance-engine`: NCAA rule evaluation
- `@aah/api-utils`: API response utilities

## Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build
pnpm build

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Integration

The eligibility-engine integrates with:

- Database for student, course, and compliance data
- Compliance-engine for NCAA rule evaluation
- Other services via HTTP API

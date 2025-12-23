# Implementation Plan: NCAA Transfer Credit Evaluation System

## Executive Summary

Agentic parallel development approach targeting 3-phase implementation from PRD with accelerated timelines through autonomous agent workflows. The plan leverages existing monorepo structure with Vercel tech stack, extending it with new microservices, database schemas, and AI agents.

---

## 1. Architecture Enhancements

### 1.1 New Packages to Create

```
packages/
├── document-processing/   # OCR & document ingestion
├── course-mapping/       # Transfer credit equivalency
├── compliance-engine/     # NCAA rules engine
├── report-generation/     # PDF/CSV report builders
└── integration-adapter/   # SIS integration framework
```

### 1.2 New Services to Create

```
services/
├── document-ingestion/     # Hono-based microservice
├── eligibility-engine/     # Core evaluation logic
├── course-mapping/         # Equivalency matching
└── report-service/         # Output generation
```

### 1.3 New Frontend Routes

```
apps/admin/app/
├── compliance/
│   ├── dashboard/           # Compliance officer home
│   ├── transcript-upload/    # FR-1, FR-4
│   ├── eligibility-review/    # FR-5-FR-10
│   ├── course-mapping/       # Course equivalency management
│   ├── reports/             # FR-11-FR-14
│   └── audit-trail/        # Audit log viewer
└── admin/
    ├── rules/               # NCAA rule configuration
    ├── institutions/         # Target institution settings
    └── users/              # RBAC management (FR-16)
```

---

## 2. Database Schema Expansion

### 2.1 New Prisma Models Required

```prisma
// Transfer Evaluation Models
model TransferEvaluation {
  id                  String   @id @default(cuid())
  studentProfileId    String
  studentProfile       StudentProfile @relation(fields: [studentProfileId], references: [id], onDelete: Cascade)

  // Source Institution
  sourceInstitutionId String
  sourceInstitution   Institution @relation(fields: [sourceInstitutionId], references: [id])

  // Target Institution
  targetInstitutionId String
  targetInstitution   Institution @relation(fields: [targetInstitutionId], references: [id])

  // Document
  documentId          String   @unique
  document           TranscriptDocument @relation(fields: [documentId], references: [id])

  // Results
  eligibilityStatus   EligibilityStatus
  cumulativeGPA       Float
  creditsTransferred  Int
  creditsAccepted     Int

  // Rule application
  rulesApplied        Json     // List of NCAA bylaws applied
  violations         Json     // FR-9: Violation flags with bylaw refs
  remediationGuidance String?  @db.Text

  // Metadata
  confidenceScore     Float    // From Verification Agent
  escalatedToHuman   Boolean  @default(false)
  humanOverrideReason String?  @db.Text

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // Audit trail
  auditLog           AuditLog[]
}

model TranscriptDocument {
  id                  String   @id @default(cuid())
  studentProfileId    String?
  studentProfile       StudentProfile? @relation(fields: [studentProfileId], references: [id], onDelete: Cascade)

  fileUrl             String
  fileName            String
  fileType            String   // PDF, JPEG, PNG, EDI
  fileSize            Int

  // OCR Results
  extractionStatus    ExtractionStatus
  confidenceScore     Float?
  extractedData       Json     // Normalized transcript data
  ocrErrors          Json?

  // Metadata
  uploadedBy         String   // User ID
  uploadedAt         DateTime @default(now())
  processedAt        DateTime?

  evaluations        TransferEvaluation[]
}

model CourseMapping {
  id                  String   @id @default(cuid())

  // Source Course
  sourceInstitutionId String
  sourceInstitution   Institution @relation(fields: [sourceInstitutionId], references: [id])
  sourceCourseCode    String
  sourceCourseName    String
  sourceCredits       Float
  sourceSubject      SubjectArea

  // Target Course
  targetInstitutionId String
  targetInstitution   Institution @relation(fields: [targetInstitutionId], references: [id])
  targetCourseCode    String
  targetCourseName    String
  targetCredits       Float
  targetSubject      SubjectArea

  // Mapping metadata
  confidenceScore     Float    // From Course Mapping Agent
  manuallyVerified    Boolean  @default(false)
  verifiedBy         String?   // User ID

  // Version control
  effectiveDate      DateTime @default(now())
  endDate            DateTime?

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model Institution {
  id              String        @id @default(cuid())
  name            String        @unique
  code            String        @unique  // e.g., "USC", "UCLA"
  type            InstitutionType

  // NCAA config
  division        NCAADivision
  requiresCertification Boolean  @default(true)

  // SIS config
  sisType         SISType?
  sisEndpoint     String?
  sisCredentials  Json?         // Encrypted

  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  sourceMappings CourseMapping[]
  targetMappings CourseMapping[]
}

model NCAARule {
  id              String   @id @default(cuid())
  bylawNumber     String   // e.g., "14.5.1"
  title           String
  description      String   @db.Text
  category        String   // "Transfer", "GPA", "Credits"

  // Version control
  effectiveDate    DateTime @default(now())
  endDate         DateTime?

  // Rule logic
  ruleCode        Json     // Executable rule logic
  parameters      Json?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model AuditLog {
  id                String   @id @default(cuid())
  transferEvalId     String   @unique
  transferEvaluation TransferEvaluation @relation(fields: [transferEvalId], references: [id])

  agentType         AgentType
  actionType        String   // "ocr_extraction", "course_mapping", etc.
  inputParams       Json
  outputResult      Json
  timestamp         DateTime @default(now())
  latencyMs         Int
}

// Enums
enum EligibilityStatus {
  ELIGIBLE
  NOT_ELIGIBLE
  PENDING_REVIEW
  REQUIRES_WAIVER
}

enum ExtractionStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  MANUAL_REVIEW_REQUIRED
}

enum SubjectArea {
  ENGLISH
  MATH
  NATURAL_SCIENCE
  PHYSICAL_SCIENCE
  SOCIAL_SCIENCE
  ARTS_HUMANITIES
  ELECTIVE
}

enum InstitutionType {
  FOUR_YEAR
  TWO_YEAR
  COMMUNITY_COLLEGE
  INTERNATIONAL
}

enum NCAADivision {
  DI
  DII
  DIII
}

enum SISType {
  BANNER
  PEOPLESOFT
  COLLEAGUE
  JICS
  WORKDAY
  CUSTOM
}

enum AgentType {
  DOCUMENT_INGESTION
  COURSE_MAPPING
  ELIGIBILITY_EVALUATION
  VERIFICATION
  REPORT_GENERATION
  ORCHESTRATOR
}
```

---

## 3. Agentic Workflow Architecture

### 3.1 Supervisor-Worker Pattern Implementation

**Orchestrator Agent** (`packages/ai/src/orchestrator.ts`)

```typescript
interface WorkflowConfig {
  studentId: string;
  documentId: string;
  sourceInstitutionId: string;
  targetInstitutionId: string;
  confidenceThresholds: {
    ocr: number; // <95% → human review
    courseMapping: number; // <70% → human review
    ruleApplication: number; // <99% → human review
  };
}

class TransferEvaluationOrchestrator {
  async execute(config: WorkflowConfig) {
    // Step 1: Document Ingestion
    const ocrResult = await this.invokeAgent("DOCUMENT_INGESTION", config);

    if (ocrResult.confidence < config.confidenceThresholds.ocr) {
      return this.escalateToHuman("LOW_OCR_CONFIDENCE", ocrResult);
    }

    // Step 2: Course Mapping
    const mappingResult = await this.invokeAgent("COURSE_MAPPING", {
      ...config,
      extractedData: ocrResult.data,
    });

    // Step 3: Eligibility Evaluation
    const eligibilityResult = await this.invokeAgent("ELIGIBILITY_EVALUATION", {
      ...config,
      courseMapping: mappingResult.mapping,
    });

    // Step 4: Verification
    const verificationResult = await this.invokeAgent("VERIFICATION", {
      ...config,
      ocrResult,
      mappingResult,
      eligibilityResult,
    });

    // Step 5: Report Generation
    if (verificationResult.verified) {
      await this.invokeAgent("REPORT_GENERATION", {
        ...config,
        results: verificationResult,
      });
    }

    return verificationResult;
  }
}
```

### 3.2 Agent Specifications

**Document Ingestion Agent** (`services/document-ingestion/src/index.ts`)

- OCR using Tesseract.js (open source)
- Document classification (PDF vs Image)
- Structured data extraction normalization
- Confidence scoring per field

**Course Mapping Agent** (`services/course-mapping/src/index.ts`)

- Semantic similarity using embeddings (pgvector)
- Multi-institution lookup tables
- Credit hour conversion
- Subject area classification

**Eligibility Evaluation Agent** (`services/eligibility-engine/src/index.ts`)

- NCAA Bylaw 14.5 rule application
- GPA calculations (cumulative + subject-area)
- Progress-toward-degree validation
- Violation flagging with bylaw references

**Verification Agent** (`packages/ai/src/agents/verification.ts`)

- Cross-check calculations
- Validate rule application consistency
- Logical consistency checks
- Confidence assessment

**Report Generation Agent** (`services/report-service/src/index.ts`)

- PDF generation with jsPDF
- Audit trail compilation
- Digital signature capability
- CSV/JSON export

---

## 4. Parallel Development Workstreams

### 4.1 Workstream A: Infrastructure & Data (Days 1-14)

**Lead Agent**: Infrastructure Architect Agent
**Parallel Subagents**:

1. Database Schema Agent → Expand Prisma schema
2. SIS Integration Framework Agent → Build integration adapter
3. Auth/RBAC Agent → Implement FR-16 with SSO

**Deliverables**:

- Complete Prisma schema migration
- Integration adapter framework with 5 SIS connectors
- SSO implementation with SAML 2.0

### 4.2 Workstream B: Document Processing (Days 1-21)

**Lead Agent**: Document Processing Agent
**Parallel Subagents**:

1. OCR Agent → Implement Tesseract.js integration
2. Document Classification Agent → File type detection
3. Data Normalization Agent → Extracted data standardization

**Deliverables**:

- OCR service with ≥95% accuracy
- Multi-format ingestion (PDF, JPEG, PNG, EDI)
- Batch processing support (50 transcripts)

### 4.3 Workstream C: NCAA Rules Engine (Days 1-21)

**Lead Agent**: Compliance Rules Agent
**Parallel Subagents**:

1. Rule Encoding Agent → Bylaw 14.5 implementation
2. GPA Calculation Agent → All GPA types
3. Progress-Toward-Degree Agent → PTD logic

**Deliverables**:

- Complete NCAA Division I rule set
- Version-controlled rule definitions
- Test suite with 50+ scenarios

### 4.4 Workstream D: Course Mapping (Days 8-28)

**Lead Agent**: Course Mapping Agent
**Parallel Subagents**:

1. Embedding Agent → Vector similarity implementation
2. Equivalency Agent → Multi-institution matching
3. Subject Classification Agent → NCAA core subject taxonomy

**Deliverables**:

- Semantic course matching engine
- Multi-institution database
- Confidence scoring

### 4.5 Workstream E: Frontend Development (Days 8-35)

**Lead Agent**: Frontend Architect Agent
**Parallel Subagents**:

1. Compliance Dashboard Agent → Admin interface
2. Upload UI Agent → Transcript upload flow
3. Review Interface Agent → Eligibility review screens

**Deliverables**:

- Complete admin UI
- Mobile-responsive design (FR-15)
- WCAG 2.1 AA compliance (FR-18)

### 4.6 Workstream F: Reporting & Audit (Days 15-42)

**Lead Agent**: Report Generation Agent
**Parallel Subagents**:

1. PDF Generator Agent → Report formatting
2. Audit Trail Agent → Logging system
3. Export Agent → JSON/CSV outputs

**Deliverables**:

- Digital signature capable reports
- 7-year audit retention
- Export APIs

### 4.7 Workstream G: Integration (Days 22-56)

**Lead Agent**: Integration Agent
**Parallel Subagents**:

1. Banner Connector Agent → Ellucian Banner integration
2. PeopleSoft Connector Agent → Oracle PeopleSoft
3. Colleague Connector Agent → Ellucian Colleague
4. Custom SIS Agent → Generic REST/SFTP adapter

**Deliverables**:

- 5+ SIS connectors
- Bidirectional data flow
- Webhook support

### 4.8 Workstream H: Testing & QA (Days 30-70)

**Lead Agent**: QA Orchestrator Agent
**Parallel Subagents**:

1. Unit Test Agent → Component tests
2. Integration Test Agent → End-to-end flows
3. Performance Test Agent → Load testing (100 users)

**Deliverables**:

- 90%+ code coverage
- Performance benchmarks met
- Security audit complete

---

## 5. Detailed Task Breakdown by Phase

### Phase 1: Foundation (Target: Days 1-35)

#### Week 1-2: Core Setup

- [ ] Database schema expansion (Workstream A)
- [ ] Prisma client regeneration
- [ ] Document ingestion service stub (Workstream B)
- [ ] OCR library evaluation & selection (Tesseract.js)
- [ ] Basic web UI layout (Workstream E)

#### Week 3-4: Document Processing

- [ ] OCR implementation with confidence scoring
- [ ] Document classification pipeline
- [ ] Batch upload support (up to 50)
- [ ] Error handling & retry logic
- [ ] Admin upload interface

#### Week 5: Core Rules Engine

- [ ] Bylaw 14.5 encoding
- [ ] Cumulative GPA calculation
- [ ] Subject-area GPA calculation
- [ ] Basic eligibility determination

#### Week 6-7: Agent Orchestration

- [ ] Orchestrator agent implementation
- [ ] Message passing protocol
- [ ] State management
- [ ] Human-in-the-loop breakpoints

#### Week 8-9: Verification & Testing

- [ ] Verification agent cross-checks
- [ ] Test case development (50 scenarios)
- [ ] Internal pilot deployment
- [ ] 2 compliance officer onboarding

**Phase 1 Deliverables**: Internal pilot with 2 compliance officers

### Phase 2: Enhancement (Target: Days 36-70)

#### Week 11-12: Course Mapping

- [ ] Embedding generation for course catalogs
- [ ] Vector database setup (pgvector)
- [ ] Semantic similarity matching
- [ ] Multi-institution database CRUD

#### Week 13-14: Advanced Rules

- [ ] Progress-toward-degree calculation
- [ ] Transfer-specific rules
- [ ] Waiver flagging logic
- [ ] 'What-if' scenario modeling

#### Week 15-16: Verification & Batch

- [ ] Complete verification agent
- [ ] Batch processing queue
- [ ] Confidence-based routing
- [ ] Human escalation workflow

#### Week 17-18: Student Self-Service

- [ ] Student portal access
- [ ] Preliminary assessment UI
- [ ] Status tracking
- [ ] Document upload for students

#### Week 19-20: SIS Integration

- [ ] Banner connector
- [ ] PeopleSoft connector
- [ ] Colleague connector
- [ ] Generic REST adapter

**Phase 2 Deliverables**: Expanded pilot (10+ compliance officers, limited student access)

### Phase 3: Scale & Optimize (Target: Days 71-105)

#### Week 21-22: Advanced Analytics

- [ ] Performance optimization
- [ ] What-if scenario refinement
- [ ] Advanced dashboard metrics
- [ ] Risk monitoring dashboard

#### Week 23-24: NCAA Compliance Assistant

- [ ] External API integration
- [ ] Certification flow
- [ ] Report submission automation

#### Week 25-26: Security & Compliance

- [ ] SOC 2 Type II audit prep
- [ ] Security penetration testing
- [ ] FERPA compliance verification
- [ ] Encryption at rest (AES-256)

#### Week 27-28: Production Readiness

- [ ] Load testing (100 concurrent users)
- [ ] Disaster recovery testing
- [ ] Uptime monitoring setup (99.9% target)
- [ ] Documentation completion

#### Week 29-30: Launch

- [ ] Production deployment
- [ ] Final QA validation
- [ ] Training materials delivery
- [ ] Go-live with full feature set

**Phase 3 Deliverables**: Production release

---

## 6. Technology Choices

### 6.1 Open Source OCR

- **Primary**: Tesseract.js (JavaScript port of Google Tesseract)
- **Fallback**: pdf.js for PDF text extraction
- **Preprocessing**: sharp.js for image optimization
- **Alternative evaluation**: GOCR, Ocrad

### 6.2 SIS Integration Framework

```typescript
interface SISAdapter {
  type: "BANNER" | "PEOPLESOFT" | "COLLEAGUE" | "CUSTOM";
  authenticate(credentials: SISCredentials): Promise<Session>;
  getStudentGrades(studentId: string): Promise<GradeRecord[]>;
  getTranscript(studentId: string): Promise<Transcript>;
  pushEvaluation(evaluation: TransferEvaluation): Promise<void>;
  subscribeToUpdates(webhookUrl: string): Promise<void>;
}
```

### 6.3 Vector Database

- Vercel Postgres with pgvector extension
- Embedding model: text-embedding-3-small (cost-optimized)
- Index: ivfflat for approximate nearest neighbor

### 6.4 Report Generation

- PDF: jsPDF + jsPDF-AutoTable
- Digital signatures: node-signpdf
- CSV: papaparse
- Templates: handlebars

---

## 7. API Specifications

### 7.1 Transfer Evaluation API

```
POST /api/transfers/evaluate
  Body: {
    studentId: string,
    documentId: string,
    sourceInstitutionId: string,
    targetInstitutionId: string,
    manualOverrides?: { [ruleId: string]: any }
  }
  Response: {
    evaluationId: string,
    status: 'PROCESSING' | 'COMPLETED' | 'REQUIRES_REVIEW',
    estimatedCompletion: ISO8601
  }

GET /api/transfers/evaluations/:id
  Response: TransferEvaluation

POST /api/transfers/evaluations/:id/override
  Body: {
    ruleId: string,
    justification: string,
    newValue: any
  }
  Response: { success: boolean }

GET /api/transfers/evaluations/:id/audit-trail
  Response: AuditLog[]
```

### 7.2 Course Mapping API

```
POST /api/course-mappings
  Body: {
    sourceCourseCode: string,
    sourceInstitutionId: string,
    targetCourseCode: string,
    targetInstitutionId: string,
    manuallyVerified: boolean
  }
  Response: CourseMapping

POST /api/course-mappings/batch-import
  Body: CourseMapping[]
  Response: { imported: number, errors: string[] }

GET /api/course-mappings/search
  Query: {
    sourceCode?: string,
    targetInstitutionId: string,
    subjectArea?: SubjectArea
  }
  Response: CourseMapping[]
```

### 7.3 SIS Integration API

```
POST /api/integrations/sis/test-connection
  Body: { sisType: SISType, credentials: EncryptedCredentials }
  Response: { connected: boolean, latency: number }

POST /api/integrations/sis/sync
  Body: { institutionId: string, syncType: 'FULL' | 'INCREMENTAL' }
  Response: { jobId: string }

GET /api/integrations/sis/status/:jobId
  Response: { status: 'RUNNING' | 'COMPLETED' | 'FAILED', progress: number }
```

---

## 8. Testing Strategy

### 8.1 Test Data Requirements

- 50+ transcript samples from varied institutions
- Known good/bad eligibility cases
- Edge cases (international credits, non-traditional grading)
- Boundary cases (minimum thresholds)

### 8.2 Performance Targets (from PRD)

- Single transcript: <5 minutes (P95)
- Batch of 50: <30 minutes
- UI response: <2 seconds
- OCR accuracy: ≥98%
- Course mapping confidence: ≥90%

### 8.3 Automated Testing

```typescript
// Example: Compliance rule test
describe("NCAA Bylaw 14.5.1", () => {
  it("should flag insufficient credit hours", async () => {
    const result = await eligibilityEngine.evaluate({
      credits: 5, // Below 6-credit minimum
      academicYear: 2,
    });
    expect(result.violations).toContainEqual({
      bylaw: "14.5.1",
      message: "Minimum 6 credits required for eligibility",
    });
  });
});
```

---

## 9. Risk Mitigation

| Risk                           | Mitigation Strategy                                    |
| ------------------------------ | ------------------------------------------------------ |
| OCR accuracy on varied formats | Ensemble approach + human-in-loop fallback             |
| NCAA rule changes mid-project  | Versioned rules with hot-swap capability               |
| SIS integration complexity     | Generic adapter pattern + mock testing first           |
| User adoption resistance       | Early stakeholder involvement + comprehensive training |
| Agent hallucinations           | Verification agent + deterministic rule layer          |

---

## 10. Acceleration Through Agentic Parallelism

### 10.1 Daily Synchronization

Each workstream lead agent syncs daily to resolve dependencies:

```
1. Database schema changes → Notify all workstreams
2. API contract changes → Update consumer workstreams
3. Shared library updates → Cascade through dependents
```

### 10.2 Continuous Integration

- Turborepo handles parallel builds
- Agent-created PRs auto-reviewed by other agents
- Deployment on green tests only

### 10.3 Quality Gates

Between phases:

1. **Phase 1 → Phase 2**: OCR ≥95% accuracy, 50 test cases pass
2. **Phase 2 → Phase 3**: Batch processing verified, SIS connectors tested
3. **Phase 3 → Production**: 99.9% uptime 30-day validation, SOC 2 audit passed

---

**Estimated Timeline with Agentic Parallelism: 105 days (3.5 months)** vs PRD's 12-month timeline

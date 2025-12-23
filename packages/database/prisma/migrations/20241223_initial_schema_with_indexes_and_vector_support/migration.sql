-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Role enum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADVISOR', 'ADMIN', 'COMPLIANCE_OFFICER');

-- EnrollmentStatus enum
CREATE TYPE "EnrollmentStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'DROPPED', 'WITHDRAWN');

-- SessionStatus enum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- ComplianceStatus enum
CREATE TYPE "ComplianceStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'EXEMPTED');

-- InstitutionType enum
CREATE TYPE "InstitutionType" AS ENUM ('UNIVERSITY', 'COLLEGE', 'COMMUNITY_COLLEGE', 'JUNIOR_COLLEGE', 'TECHNICAL_SCHOOL');

-- NCAADivision enum
CREATE TYPE "NCAADivision" AS ENUM ('DIVISION_I', 'DIVISION_II', 'DIVISION_III', 'NAIA', 'NJCAA');

-- SISType enum
CREATE TYPE "SISType" AS ENUM ('FULL_SIS', 'PARTIAL_SIS', 'MANUAL_TRANSCRIPT', 'PDF_TRANSCRIPT');

-- SubjectArea enum
CREATE TYPE "SubjectArea" AS ENUM ('ENGLISH', 'MATH', 'NATURAL_SCIENCE', 'SOCIAL_SCIENCE', 'HUMANITIES', 'FINE_ARTS', 'PHYSICAL_EDUCATION', 'FOREIGN_LANGUAGE', 'COMPOSITION', 'SPEECH', 'PHILOSOPHY', 'PSYCHOLOGY', 'SOCIOLOGY', 'POLITICAL_SCIENCE', 'ECONOMICS', 'HISTORY', 'GEOGRAPHY', 'COMPUTER_SCIENCE', 'INFORMATION_TECHNOLOGY', 'BUSINESS', 'ACCOUNTING', 'MARKETING', 'MANAGEMENT', 'FINANCE');

-- EligibilityStatus enum
CREATE TYPE "EligibilityStatus" AS ENUM ('PENDING_REVIEW', 'ELIGIBLE', 'INELIGIBLE', 'CONDITIONAL', 'NEEDS_DOCUMENTATION', 'UNDER_EVALUATION', 'APPEALED');

-- ExtractionStatus enum
CREATE TYPE "ExtractionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'PARTIAL', 'REQUIRES_REVIEW');

-- AgentType enum
CREATE TYPE "AgentType" AS ENUM ('EVALUATION_AGENT', 'COMPLIANCE_AGENT', 'DOCUMENT_AGENT', 'RULE_ENGINE', 'NOTIFICATION_AGENT', 'ADVISOR_AGENT');

-- VerificationStatus enum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'MANUAL_REVIEW', 'AUTO_APPROVED', 'EXEMPTION_GRANTED');

-- User table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Admin profile table
CREATE TABLE "admin_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissions" TEXT[],

    CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id")
);

-- Advisor profile table
CREATE TABLE "advisor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "department" TEXT NOT NULL,

    CONSTRAINT "advisor_profiles_pkey" PRIMARY KEY ("id")
);

-- Student profile table
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "gpa" DOUBLE PRECISION,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "eligibility" BOOLEAN NOT NULL DEFAULT true,
    "advisorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- Course table
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "department" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- Course enrollments table
CREATE TABLE "course_enrollments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "grade" TEXT,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- Tutoring sessions table
CREATE TABLE "tutoring_sessions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "notes" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutoring_sessions_pkey" PRIMARY KEY ("id")
);

-- Compliance records table
CREATE TABLE "compliance_records" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_records_pkey" PRIMARY KEY ("id")
);

-- Institutions table
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "InstitutionType" NOT NULL,
    "ncaaDivision" "NCAADivision",
    "ncaaCertified" BOOLEAN NOT NULL DEFAULT false,
    "sisType" "SISType",
    "region" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "state" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- Transcript documents table
CREATE TABLE "transcript_documents" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "institutionId" TEXT,
    "transferEvaluationId" TEXT UNIQUE,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "extractionStatus" "ExtractionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "extractionStartedAt" TIMESTAMP(3),
    "extractionCompletedAt" TIMESTAMP(3),
    "extractionMetadata" JSONB,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "transcript_documents_pkey" PRIMARY KEY ("id")
);

-- Document embeddings table
CREATE TABLE "document_embeddings" (
    "id" TEXT NOT NULL,
    "transcriptDocumentId" TEXT NOT NULL,
    "embedding" vector(1536),
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_embeddings_pkey" PRIMARY KEY ("id")
);

-- Transfer evaluations table
CREATE TABLE "transfer_evaluations" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "sourceInstitutionId" TEXT NOT NULL,
    "targetInstitutionId" TEXT,
    "transcriptDocumentId" TEXT UNIQUE,
    "eligibilityStatus" "EligibilityStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "totalCredits" INTEGER NOT NULL DEFAULT 0,
    "transferableCredits" INTEGER NOT NULL DEFAULT 0,
    "gpa" DOUBLE PRECISION,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "evaluationNotes" TEXT,
    "evaluationMetadata" JSONB,
    "evaluatedAt" TIMESTAMP(3),
    "evaluatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_evaluations_pkey" PRIMARY KEY ("id")
);

-- Course mappings table
CREATE TABLE "course_mappings" (
    "id" TEXT NOT NULL,
    "transferEvaluationId" TEXT NOT NULL,
    "sourceInstitutionId" TEXT NOT NULL,
    "targetInstitutionId" TEXT,
    "sourceCourseCode" TEXT NOT NULL,
    "sourceCourseTitle" TEXT NOT NULL,
    "sourceCredits" INTEGER NOT NULL,
    "sourceSubjectArea" "SubjectArea" NOT NULL,
    "targetCourseCode" TEXT,
    "targetCourseTitle" TEXT,
    "targetCredits" INTEGER,
    "targetSubjectArea" "SubjectArea",
    "isEquivalent" BOOLEAN NOT NULL DEFAULT false,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verificationNotes" TEXT,
    "ruleApplied" TEXT,
    "exceptionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_mappings_pkey" PRIMARY KEY ("id")
);

-- NCAA rules table
CREATE TABLE "ncaa_rules" (
    "id" TEXT NOT NULL,
    "bylawNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "division" "NCAADivision",
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "agentType" "AgentType",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "effectiveDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ncaa_rules_pkey" PRIMARY KEY ("id")
);

-- Audit logs table
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "transferEvaluationId" TEXT NOT NULL,
    "agentType" "AgentType" NOT NULL,
    "action" TEXT NOT NULL,
    "inputData" JSONB,
    "outputData" JSONB,
    "errorMessage" TEXT,
    "duration" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE UNIQUE INDEX "admin_profiles_userId_key" ON "admin_profiles"("userId");

CREATE UNIQUE INDEX "advisor_profiles_userId_key" ON "advisor_profiles"("userId");

CREATE UNIQUE INDEX "student_profiles_userId_key" ON "student_profiles"("userId");
CREATE UNIQUE INDEX "student_profiles_studentId_key" ON "student_profiles"("studentId");
CREATE INDEX "student_profiles_studentId_idx" ON "student_profiles"("studentId");
CREATE INDEX "student_profiles_advisorId_idx" ON "student_profiles"("advisorId");
CREATE INDEX "student_profiles_eligibility_idx" ON "student_profiles"("eligibility");

CREATE UNIQUE INDEX "courses_code_semester_year_key" ON "courses"("code", "semester", "year");

CREATE UNIQUE INDEX "course_enrollments_studentId_courseId_key" ON "course_enrollments"("studentId", "courseId");

CREATE UNIQUE INDEX "institutions_code_key" ON "institutions"("code");
CREATE INDEX "institutions_code_idx" ON "institutions"("code");
CREATE INDEX "institutions_type_idx" ON "institutions"("type");
CREATE INDEX "institutions_ncaaDivision_idx" ON "institutions"("ncaaDivision");
CREATE INDEX "institutions_isActive_idx" ON "institutions"("isActive");

CREATE INDEX "transcript_documents_studentProfileId_idx" ON "transcript_documents"("studentProfileId");
CREATE INDEX "transcript_documents_institutionId_idx" ON "transcript_documents"("institutionId");
CREATE INDEX "transcript_documents_extractionStatus_idx" ON "transcript_documents"("extractionStatus");
CREATE INDEX "transcript_documents_uploadedAt_idx" ON "transcript_documents"("uploadedAt");
CREATE UNIQUE INDEX "transcript_documents_transferEvaluationId_key" ON "transcript_documents"("transferEvaluationId");

CREATE INDEX "document_embeddings_transcriptDocumentId_idx" ON "document_embeddings"("transcriptDocumentId");

CREATE INDEX "transfer_evaluations_studentProfileId_idx" ON "transfer_evaluations"("studentProfileId");
CREATE INDEX "transfer_evaluations_sourceInstitutionId_idx" ON "transfer_evaluations"("sourceInstitutionId");
CREATE INDEX "transfer_evaluations_targetInstitutionId_idx" ON "transfer_evaluations"("targetInstitutionId");
CREATE INDEX "transfer_evaluations_eligibilityStatus_idx" ON "transfer_evaluations"("eligibilityStatus");
CREATE INDEX "transfer_evaluations_createdAt_idx" ON "transfer_evaluations"("createdAt");
CREATE INDEX "transfer_evaluations_studentProfileId_eligibilityStatus_idx" ON "transfer_evaluations"("studentProfileId", "eligibilityStatus");
CREATE UNIQUE INDEX "transfer_evaluations_transcriptDocumentId_key" ON "transfer_evaluations"("transcriptDocumentId");

CREATE INDEX "course_mappings_transferEvaluationId_idx" ON "course_mappings"("transferEvaluationId");
CREATE INDEX "course_mappings_sourceInstitutionId_idx" ON "course_mappings"("sourceInstitutionId");
CREATE INDEX "course_mappings_targetInstitutionId_idx" ON "course_mappings"("targetInstitutionId");
CREATE INDEX "course_mappings_sourceCourseCode_idx" ON "course_mappings"("sourceCourseCode");
CREATE INDEX "course_mappings_sourceSubjectArea_idx" ON "course_mappings"("sourceSubjectArea");
CREATE INDEX "course_mappings_targetSubjectArea_idx" ON "course_mappings"("targetSubjectArea");
CREATE INDEX "course_mappings_isEquivalent_idx" ON "course_mappings"("isEquivalent");
CREATE INDEX "course_mappings_verificationStatus_idx" ON "course_mappings"("verificationStatus");

CREATE UNIQUE INDEX "ncaa_rules_bylawNumber_key" ON "ncaa_rules"("bylawNumber");

CREATE INDEX "audit_logs_transferEvaluationId_idx" ON "audit_logs"("transferEvaluationId");
CREATE INDEX "audit_logs_agentType_idx" ON "audit_logs"("agentType");
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");
CREATE INDEX "audit_logs_transferEvaluationId_timestamp_idx" ON "audit_logs"("transferEvaluationId", "timestamp");

-- Create foreign key constraints
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "advisor_profiles" ADD CONSTRAINT "advisor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "advisor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tutoring_sessions" ADD CONSTRAINT "tutoring_sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "compliance_records" ADD CONSTRAINT "compliance_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "transcript_documents" ADD CONSTRAINT "transcript_documents_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transcript_documents" ADD CONSTRAINT "transcript_documents_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transcript_documents" ADD CONSTRAINT "transcript_documents_transferEvaluationId_fkey" FOREIGN KEY ("transferEvaluationId") REFERENCES "transfer_evaluations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "document_embeddings" ADD CONSTRAINT "document_embeddings_transcriptDocumentId_fkey" FOREIGN KEY ("transcriptDocumentId") REFERENCES "transcript_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "transfer_evaluations" ADD CONSTRAINT "transfer_evaluations_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transfer_evaluations" ADD CONSTRAINT "transfer_evaluations_sourceInstitutionId_fkey" FOREIGN KEY ("sourceInstitutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transfer_evaluations" ADD CONSTRAINT "transfer_evaluations_targetInstitutionId_fkey" FOREIGN KEY ("targetInstitutionId") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transfer_evaluations" ADD CONSTRAINT "transfer_evaluations_transcriptDocumentId_fkey" FOREIGN KEY ("transcriptDocumentId") REFERENCES "transcript_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "course_mappings" ADD CONSTRAINT "course_mappings_transferEvaluationId_fkey" FOREIGN KEY ("transferEvaluationId") REFERENCES "transfer_evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_mappings" ADD CONSTRAINT "course_mappings_sourceInstitutionId_fkey" FOREIGN KEY ("sourceInstitutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_mappings" ADD CONSTRAINT "course_mappings_targetInstitutionId_fkey" FOREIGN KEY ("targetInstitutionId") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_transferEvaluationId_fkey" FOREIGN KEY ("transferEvaluationId") REFERENCES "transfer_evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

# @aah/schemas

Base Zod schemas and TypeScript types for the Athletic Academics Hub.

## Installation

This package is part of the monorepo and should be installed via workspace protocol:

```bash
pnpm add @aah/schemas
```

## Usage

### Base Schemas

```typescript
import {
  IDSchema,
  EmailSchema,
  TimestampSchema,
  ResponseSchema,
} from "@aah/schemas";

// Validate an ID
const id = IDSchema.parse("clh123...");

// Validate email
const email = EmailSchema.parse("user@example.com");

// Use timestamp schema
const timestamp = TimestampSchema.parse({
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Create a response schema
const UserResponseSchema = ResponseSchema(UserSchema);
```

### Domain Schemas

```typescript
import { StudentProfileSchema, CourseSchema, RoleSchema } from "@aah/schemas";

// Validate student data
const student = StudentProfileSchema.parse({
  id: "clh123...",
  userId: "clh456...",
  studentId: "12345678",
  sport: "FOOTBALL",
  year: 2,
  gpa: 3.5,
  credits: 30,
  eligibility: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Infer TypeScript types
type StudentProfile = z.infer<typeof StudentProfileSchema>;
```

## Available Schemas

### Base

- `IDSchema` - CUID string validation
- `EmailSchema` - Email validation
- `PhoneSchema` - Phone number validation
- `URLSchema` - URL validation
- `TimestampSchema` - Created/updated timestamps
- `PaginationSchema` - Pagination parameters
- `ResponseSchema<T>` - Generic API response wrapper
- `PaginatedResponseSchema<T>` - Paginated response wrapper

### User

- `RoleSchema` - User roles (STUDENT, ADVISOR, ADMIN, COMPLIANCE_OFFICER)
- `UserSchema` - Complete user object
- `CreateUserSchema` - User creation schema
- `UpdateUserSchema` - User update schema

### Student

- `SportSchema` - Supported sports
- `EligibilityStatusSchema` - Eligibility statuses
- `StudentProfileSchema` - Student profile object
- `CreateStudentProfileSchema` - Student creation schema
- `UpdateStudentProfileSchema` - Student update schema

### Course

- `GradeSchema` - Valid grades (A-F, I, W, P, NP)
- `CourseStatusSchema` - Course statuses
- `CourseSchema` - Course object
- `CreateCourseSchema` - Course creation schema
- `CourseEnrollmentSchema` - Enrollment object
- `CreateCourseEnrollmentSchema` - Enrollment creation schema

## TypeScript Types

All schemas export TypeScript types:

```typescript
import type {
  ID,
  Email,
  User,
  StudentProfile,
  Course,
  Role,
  Sport,
  Grade,
} from "@aah/schemas";
```

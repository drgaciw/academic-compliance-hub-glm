# Database Package Tests

This directory contains comprehensive unit tests for the Prisma models.

## Test Files

### Fully Implemented Tests (Models Exist in Schema)

1. **user.test.ts** - Tests for User model
   - Model creation tests
   - Field validation tests
   - CRUD operations
   - Edge case tests

2. **student-profile.test.ts** - Tests for StudentProfile model
   - Model creation tests
   - Field validation tests
   - Relation tests (User, CourseEnrollment, TutoringSession, ComplianceRecord)
   - CRUD operations
   - Cascade delete tests

3. **course.test.ts** - Tests for Course model
   - Model creation tests
   - Field validation tests
   - Relation tests (CourseEnrollment)
   - CRUD operations
   - Unique constraint tests

4. **course-enrollment.test.ts** - Tests for CourseEnrollment model
   - Model creation tests
   - Field validation tests
   - Relation tests (StudentProfile, Course)
   - CRUD operations
   - Cascade delete tests

5. **tutoring-session.test.ts** - Tests for TutoringSession model
   - Model creation tests
   - Field validation tests
   - Relation tests (StudentProfile)
   - CRUD operations
   - Status handling tests

6. **compliance-record.test.ts** - Tests for ComplianceRecord model
   - Model creation tests
   - Field validation tests
   - Relation tests (StudentProfile)
   - CRUD operations
   - Status and category filtering tests

### Placeholder Tests (Models Not Yet Added to Schema)

These test files document what tests should be implemented when models are added:

7. **transfer-evaluation.test.ts** - Tests for TransferEvaluation model (A1-001)
8. **transcript-document.test.ts** - Tests for TranscriptDocument model (A1-002)
9. **course-mapping.test.ts** - Tests for CourseMapping model (A1-003)
10. **institution.test.ts** - Tests for Institution model (A1-004)
11. **ncaa-rule.test.ts** - Tests for NCAARule model (A1-005)
12. **audit-log.test.ts** - Tests for AuditLog model (A1-006)

## Running Tests

To run tests, you need a PostgreSQL database running:

```bash
# Set DATABASE_URL in .env file
DATABASE_URL="postgresql://user:password@localhost:5432/database_name"

# Run tests with coverage
npm test

# Run tests without coverage
npx jest

# Run specific test file
npx jest tests/user.test.ts
```

## Database Setup

To run tests locally, you need to:

1. Install and start PostgreSQL
2. Create a test database
3. Set DATABASE_URL in .env
4. Run migrations: `npm run db:push`

Example .env:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/aah_test"
```

## Test Coverage

Target: 90%+ coverage

Current status: Tests are comprehensive and ready, but coverage reporting requires:

- Database connection
- Successfully running test suite

Test suites cover:

- Model validation
- Relation tests
- CRUD operations
- Edge cases
- Cascade deletes
- Constraint violations
- Default values
- Timestamp updates

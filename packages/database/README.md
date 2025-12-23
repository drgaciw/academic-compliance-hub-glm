# @aah/database

Prisma database schema and client for the Athletic Academics Hub.

## Overview

This package contains the Prisma schema and client for managing the AAH database.

## Features

- PostgreSQL database with Prisma ORM
- User management with role-based access
- Student profiles and academic tracking
- Course enrollment management
- Tutoring session tracking
- NCAA compliance records

## Database Commands

```bash
# Generate Prisma client
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Create and run migrations
pnpm db:migrate

# Open Prisma Studio (GUI)
pnpm db:studio
```

## Schema

The database includes the following models:
- `User` - User accounts with Clerk integration
- `StudentProfile` - Student athlete information
- `AdvisorProfile` - Academic advisor information
- `AdminProfile` - Administrator information
- `Course` - Course catalog
- `CourseEnrollment` - Student course enrollments
- `TutoringSession` - Tutoring session records
- `ComplianceRecord` - NCAA compliance tracking

## Usage

```typescript
import { prisma } from '@aah/database';

// Query users
const users = await prisma.user.findMany();

// Create a new student
const student = await prisma.studentProfile.create({
  data: {
    userId: 'user-id',
    studentId: 'STU001',
    sport: 'Basketball',
    year: 2,
  },
});
```

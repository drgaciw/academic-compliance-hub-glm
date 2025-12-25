# Prisma Migration Workflow

## Overview

This document outlines the Prisma migration workflow for the Academic Compliance Hub database, including schema changes, migration creation, and database seeding.

## Prerequisites

- PostgreSQL database running and accessible
- `DATABASE_URL` environment variable configured in `.env` file
- Prisma CLI installed (`@prisma/client` and `prisma` packages)

## Schema Management

### Modifying the Schema

1. **Edit Schema File**: Make changes to `packages/database/prisma/schema.prisma`

2. **Schema Changes Include**:
   - Adding new models
   - Adding new fields to existing models
   - Modifying relationships
   - Adding enums
   - Adding indexes

### Example: TransferRequest Model Addition

```prisma
model TransferRequest {
  id                    String                @id @default(cuid())
  studentProfileId      String
  studentProfile        StudentProfile        @relation(fields: [studentProfileId], references: [id], onDelete: Cascade)
  type                  TransferRequestType   @default(INITIAL_TRANSFER)
  status                TransferRequestStatus @default(DRAFT)
  priority              TransferRequestPriority @default(NORMAL)
  // ... additional fields
}
```

## Migration Workflow

### 1. Generate Prisma Client

After schema changes, regenerate the Prisma client:

```bash
cd packages/database
npm run db:generate
```

This command:

- Reads `schema.prisma`
- Generates type-safe Prisma Client
- Updates TypeScript types
- Creates database client in `node_modules/@prisma/client`

### 2. Create Migration

Create a new migration file:

```bash
cd packages/database
npm run db:migrate -- --name <migration_name>
```

Example:

```bash
npm run db:migrate -- --name add_transfer_requests
```

This command:

- Creates migration file in `prisma/migrations/<timestamp>_<name>/`
- Generates SQL statements for schema changes
- Applies migration to the database
- Updates `prisma/migrations/migration_lock.toml`

### 3. Reset Database (Development Only)

For development environments, reset the database and apply all migrations:

```bash
cd packages/database
npm run db:reset
```

**Warning**: This deletes all data in the database. Use only in development.

### 4. Push Schema Changes (Development Only)

For quick development without migration history:

```bash
cd packages/database
npm run db:push
```

**Warning**: Don't use in production. `db:push` bypasses migration history.

## Database Seeding

### Seed Script Location

Seed script is located at `packages/database/prisma/seed.ts`

### Running Seed Script

```bash
cd packages/database
npm run db:seed
```

### Seed Data Categories

The seed script includes:

1. **Institutions**: 13 institutions (universities and community colleges)
   - University of Southern California (USC)
   - University of California, Los Angeles (UCLA)
   - Duke University
   - Stanford University
   - And more...

2. **NCAA Rules**: 10 NCAA Bylaw 14.5 rules
   - General Regulations
   - Course Work Requirements
   - Grade-Point Average
   - Residential Requirement
   - Two-Year College Transfers
   - And more...

3. **Users & Students**: 5 student profiles
   - John Smith (Football)
   - Emily Johnson (Basketball)
   - Michael Williams (Soccer)
   - Sarah Brown (Volleyball)
   - David Jones (Swimming)

4. **Courses**: 8 courses across multiple departments
   - ENG101 - Composition I
   - MAT201 - Calculus I
   - BIO101 - General Biology
   - HIS201 - US History
   - And more...

5. **Course Enrollments**: 8 enrollments with various statuses
   - COMPLETED: A, A-, A+, B, B+
   - IN_PROGRESS: Current term enrollments

6. **Compliance Records**: 5 compliance records
   - Academic Progress
   - GPA Requirements
   - Residential Requirements
   - Initial Eligibility
   - Progress Toward Degree

7. **Transfer Requests**: 3 transfer requests
   - INITIAL_TRANSFER: Community college transfer
   - PROGRESS_TOWARD_DEGREE: 4-year institution transfer
   - ELIGIBILITY_CERTIFICATION: Summer course approval

## Migration Commands Reference

| Command               | Description                | Use Case             |
| --------------------- | -------------------------- | -------------------- |
| `npm run db:generate` | Generate Prisma Client     | After schema changes |
| `npm run db:migrate`  | Create and apply migration | Production & staging |
| `npm run db:push`     | Push schema directly       | Development only     |
| `npm run db:reset`    | Reset and re-seed          | Development only     |
| `npm run db:seed`     | Run seed script            | After database reset |
| `npm run db:studio`   | Open Prisma Studio         | Database inspection  |

## Database Inspection

### Prisma Studio

Open Prisma Studio for visual database inspection:

```bash
cd packages/database
npm run db:studio
```

This opens a web interface at `http://localhost:5555` where you can:

- View all tables
- Edit records
- Add new data
- Filter and search
- Inspect relationships

### SQL Queries

For custom SQL queries:

```bash
cd packages/database
npx prisma db execute --stdin < your_query.sql
```

## Production Migration Checklist

Before running migrations in production:

1. [ ] **Backup Database**

   ```bash
   pg_dump -U your_user -h localhost -d aah > backup.sql
   ```

2. [ ] **Review Migration File**
   - Check migration file in `prisma/migrations/`
   - Verify SQL statements are correct
   - Test in staging environment first

3. [ ] **Create Migration**

   ```bash
   npm run db:migrate -- --name descriptive_name
   ```

4. [ ] **Verify Migration**
   - Check that tables were created/modified correctly
   - Verify indexes are created
   - Test application with new schema

5. [ ] **Rollback Plan**
   - Have a rollback plan if migration fails
   - Keep backup ready for restoration

## Troubleshooting

### Migration Conflicts

If multiple developers create migrations:

1. Pull latest migration files
2. Resolve conflicts in `schema.prisma`
3. Run `npm run db:migrate -- --name conflict_resolution`

### Database Connection Issues

```
Error: P1001: Can't reach database server
```

**Solution**:

- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Verify network connectivity

### Schema Validation Errors

```
Error: Prisma schema validation
```

**Solution**:

- Check `schema.prisma` syntax
- Verify enum values match existing data
- Run `npm run db:generate` to generate types

## Best Practices

1. **Descriptive Migration Names**
   - Use clear, descriptive names: `add_transfer_requests`, `update_compliance_status`

2. **Test in Development First**
   - Always test migrations in development environment
   - Verify data integrity after migration

3. **Seed Data Consistency**
   - Keep seed data realistic and representative
   - Use `upsert` operations to avoid duplicate data
   - Include edge cases in seed data

4. **Version Control**
   - Commit migration files along with schema changes
   - Never manually modify migration files
   - Keep `schema.prisma` and migrations in sync

5. **Environment Variables**
   - Never commit `.env` file
   - Use different `DATABASE_URL` for each environment
   - Document required environment variables

## Related Documentation

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Migrate Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Database Schema Documentation](./DATABASE_SCHEMA.md)
- [Testing Documentation](../TESTING.md)

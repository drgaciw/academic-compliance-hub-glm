# 7-Year Retention Implementation Guide

This document describes the implementation of the 7-year audit log retention system (Task F2-003).

## Overview

The retention system provides automated archival, retention policy enforcement, and compliance reporting for audit logs.

## Components

### 1. Database Schema (`packages/database/prisma/schema.prisma`)

Added `AuditLogArchive` model:

- Stores archived logs separately from active logs
- Includes compression type and archive metadata
- Indexed for fast retrieval

### 2. Audit Logger Extensions (`packages/report-generation/src/audit-logger.ts`)

New methods added:

| Method                                         | Description                                            |
| ---------------------------------------------- | ------------------------------------------------------ |
| `archiveOldLogs(retentionYears, compress)`     | Finds and archives logs older than retention period    |
| `getArchivedLogs(dateRange, limit)`            | Retrieves archived logs within a date range            |
| `getActiveLogs(dateRange, limit)`              | Gets only active (non-archived) logs                   |
| `deleteArchivedLogs(beforeDate, backup)`       | Deletes archives older than specified date with backup |
| `calculateRetentionCompliance(retentionYears)` | Verifies retention policy compliance                   |
| `generateRetentionReport(retentionYears)`      | Generates formatted compliance report                  |
| `searchArchivedLogs(query, limit)`             | Search archived logs by filters                        |
| `getArchiveStatistics()`                       | Get archive statistics by agent type and year          |
| `backupArchives(beforeDate)`                   | Backup archives to JSON file before deletion           |

### 3. Archive Script (`packages/report-generation/scripts/archive-logs.js`)

Automated archival script with three commands:

```bash
# Archive logs older than 7 years (default)
npm run archive:logs

# Or run directly
node packages/report-generation/scripts/archive-logs.js archive

# Delete archives older than 10 years
npm run archive:cleanup

# Or specify custom years
node packages/report-generation/scripts/archive-logs.js cleanup 15

# Generate retention compliance report
npm run archive:report

# Or run directly
node packages/report-generation/scripts/archive-logs.js report
```

### 4. Package Scripts (`packages/report-generation/package.json`)

Added npm scripts:

- `archive:logs` - Archive old logs
- `archive:cleanup` - Delete old archives
- `archive:report` - Generate compliance report

## Setup Instructions

### Step 1: Generate Prisma Client

After adding the `AuditLogArchive` model to the schema, regenerate the Prisma client:

```bash
cd packages/database
npx prisma generate
```

### Step 2: Create Migration

Create and apply the migration to add the archive table:

```bash
cd packages/database
npx prisma migrate dev --name add_audit_log_archive
```

### Step 3: Build the Report Generation Package

```bash
cd packages/report-generation
npm run build
```

## Scheduled Archival

### Cron Job Setup

To run archival daily at 2 AM, add to your crontab:

```cron
# Run daily at 2:00 AM
0 2 * * * cd /path/to/academic-compliance-hub-glm && npm run archive:logs >> logs/archive-logs.log 2>&1
```

### Windows Task Scheduler

For Windows, create a scheduled task:

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger to Daily at 2:00 AM
4. Action: Start a program
   - Program: `node`
   - Arguments: `packages\report-generation\scripts\archive-logs.js archive`
   - Start in: `C:\Users\dgorn\my-code-00\academic-compliance-hub-glm`

### Linux Systemd Timer

Create `/etc/systemd/system/audit-log-archive.service`:

```ini
[Unit]
Description=Archive Old Audit Logs
After=network.target

[Service]
Type=oneshot
User=your-user
WorkingDirectory=/path/to/academic-compliance-hub-glm
ExecStart=/usr/bin/npm run archive:logs
```

Create `/etc/systemd/system/audit-log-archive.timer`:

```ini
[Unit]
Description=Run audit log archive daily at 2 AM

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable the timer:

```bash
sudo systemctl enable audit-log-archive.timer
sudo systemctl start audit-log-archive.timer
```

## Usage Examples

### Archive Logs Programmatically

```typescript
import { auditLogger } from "@academic-compliance/report-generation";

// Archive logs older than 7 years
const result = await auditLogger.archiveOldLogs(7, true);
console.log(`Archived ${result.archivedCount} logs`);

// Get retention compliance status
const compliance = await auditLogger.calculateRetentionCompliance(7);
console.log(`Compliance: ${compliance.isCompliant}`);

// Generate and save report
const report = await auditLogger.generateRetentionReport(7);
console.log(report);
```

### Search Archived Logs

```typescript
// Search archived logs by date range
const archives = await auditLogger.getArchivedLogs(
  {
    startDate: new Date("2020-01-01"),
    endDate: new Date("2020-12-31"),
  },
  100,
);

// Search with filters
const filteredArchives = await auditLogger.searchArchivedLogs({
  agentType: AgentType.COMPLIANCE_AGENT,
  action: "COMPLIANCE_CHECK",
  dateRange: {
    startDate: new Date("2020-01-01"),
    endDate: new Date("2020-12-31"),
  },
});
```

### Get Archive Statistics

```typescript
const stats = await auditLogger.getArchiveStatistics();
console.log(`Total archives: ${stats.totalArchives}`);
console.log(`By agent type:`, stats.archivesByAgentType);
console.log(`By year:`, stats.archivesByYear);
```

## Retention Policy Enforcement

The 7-year retention policy is enforced through:

1. **Automated Archival**: Cron job runs daily to archive logs older than 7 years
2. **Compliance Checks**: `calculateRetentionCompliance()` verifies policy adherence
3. **Reporting**: `generateRetentionReport()` provides detailed compliance status
4. **Alerts**: Recommendations are provided when policy violations are detected

## Backup Strategy

Archives are backed up before deletion:

- Backup location: `packages/report-generation/backups/`
- Format: JSON files with timestamp
- Naming: `audit-log-archive-YYYY-MM-DDTHH-MM-SSZ.json`

## Troubleshooting

### Error: "AuditLogArchive model not found"

Run the migration and regenerate the Prisma client:

```bash
cd packages/database
npx prisma migrate dev --name add_audit_log_archive
npx prisma generate
```

### No logs being archived

Check if there are logs older than the retention period:

```bash
npm run archive:report
```

### Permission errors

Ensure the script has write permissions to the backups directory.

## Compliance Verification

To verify retention compliance:

```bash
# Generate compliance report
npm run archive:report

# Check for any violations
# If non-compliant, run archival immediately
npm run archive:logs
```

## Security Considerations

1. Archived logs contain sensitive data - ensure backup directory is secured
2. Implement proper access controls on archive storage
3. Consider encryption for long-term archive storage
4. Audit all access to archived logs

## Performance Considerations

1. Archival is batched (1000 logs per batch) to avoid locking
2. Compression reduces storage requirements
3. Indexes provide fast archive search
4. Consider offloading archives to cold storage for cost optimization

## Future Enhancements

- Multi-tier storage (active vs cold archive)
- Automatic compression with GZIP
- Differential backup to reduce storage
- Archive integrity verification
- Restore functionality for disaster recovery

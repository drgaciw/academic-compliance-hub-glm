#!/usr/bin/env node

/**
 * Archive Logs Script
 *
 * This script automates the archival of audit logs older than 7 years.
 * It should be run daily via cron job:
 * 0 0 2 * * * * * ? /usr/bin/node packages/report-generation/scripts/archive-logs.js
 */

const { PrismaClient } = require("@prisma/client");
const path = require("path");

const prisma = new PrismaClient();

const RETENTION_YEARS = 7;
const COMPRESS_LOGS = true;
const BATCH_SIZE = 1000;

async function archiveOldLogs() {
  const startTime = new Date();
  console.log(
    `[${startTime.toISOString()}] Starting audit log archival process...`,
  );

  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - RETENTION_YEARS);
  console.log(
    `[${new Date().toISOString()}] Archiving logs older than: ${cutoffDate.toISOString()}`,
  );

  let archivedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const errors = [];

  try {
    // Count logs to archive
    const logsToArchiveCount = await prisma.auditLog.count({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    console.log(
      `[${new Date().toISOString()}] Found ${logsToArchiveCount} logs to archive`,
    );

    if (logsToArchiveCount === 0) {
      console.log(
        `[${new Date().toISOString()}] No logs to archive. Process complete.`,
      );
      return;
    }

    let hasMore = true;
    let offset = 0;

    while (hasMore) {
      const logs = await prisma.auditLog.findMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
        orderBy: { timestamp: "asc" },
        take: BATCH_SIZE,
        skip: offset,
      });

      if (logs.length === 0) {
        hasMore = false;
        break;
      }

      console.log(
        `[${new Date().toISOString()}] Processing batch of ${logs.length} logs...`,
      );

      for (const log of logs) {
        try {
          // Create archive entry
          await prisma.auditLogArchive.create({
            data: {
              originalLogId: log.id,
              transferEvaluationId: log.transferEvaluationId,
              agentType: log.agentType,
              action: log.action,
              inputData: log.inputData,
              outputData: log.outputData,
              errorMessage: log.errorMessage,
              duration: log.duration,
              originalTimestamp: log.timestamp,
              compressionType: COMPRESS_LOGS ? "GZIP" : "NONE",
              archiveMetadata: {
                retentionYears: RETENTION_YEARS,
                archivedBy: "SYSTEM_CRON",
                originalSchema: "AuditLog",
              },
            },
          });

          // Delete original log
          await prisma.auditLog.delete({
            where: { id: log.id },
          });

          archivedCount++;

          if (archivedCount % 100 === 0) {
            console.log(
              `[${new Date().toISOString()}] Archived ${archivedCount} logs...`,
            );
          }
        } catch (error) {
          skippedCount++;
          errorCount++;
          const errorMsg = `Failed to archive log ${log.id}: ${error.message}`;
          errors.push(errorMsg);
          console.error(`[${new Date().toISOString()}] ${errorMsg}`);
        }
      }

      offset += BATCH_SIZE;

      // Check if we've processed all logs
      const remainingCount = await prisma.auditLog.count({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      if (remainingCount === 0) {
        hasMore = false;
      }
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    console.log(
      "\n══════════════════════════════════════════════════════════════",
    );
    console.log("              ARCHIVE JOB SUMMARY");
    console.log(
      "══════════════════════════════════════════════════════════════",
    );
    console.log(`Start Time:         ${startTime.toISOString()}`);
    console.log(`End Time:           ${endTime.toISOString()}`);
    console.log(
      `Duration:           ${duration}ms (${(duration / 1000).toFixed(2)}s)`,
    );
    console.log(`────────────────────────────────────────────────────────────`);
    console.log(`Logs Archived:      ${archivedCount}`);
    console.log(`Logs Skipped:       ${skippedCount}`);
    console.log(`Errors Encountered: ${errorCount}`);
    console.log(
      "══════════════════════════════════════════════════════════════",
    );

    if (errors.length > 0) {
      console.log("\nErrors encountered:");
      errors.slice(0, 10).forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more errors`);
      }
    }

    console.log(`\n[${new Date().toISOString()}] Archive job completed.`);
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Fatal error during archival:`,
      error,
    );
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanupOldArchives(maxAgeYears = 10) {
  console.log(`[${new Date().toISOString()}] Starting archive cleanup...`);

  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - maxAgeYears);

  console.log(
    `[${new Date().toISOString()}] Deleting archives older than: ${cutoffDate.toISOString()}`,
  );

  const oldArchives = await prisma.auditLogArchive.findMany({
    where: {
      originalTimestamp: {
        lt: cutoffDate,
      },
    },
    select: { id: true, originalTimestamp: true },
  });

  console.log(
    `[${new Date().toISOString()}] Found ${oldArchives.length} archives to delete`,
  );

  let deletedCount = 0;
  for (const archive of oldArchives) {
    try {
      await prisma.auditLogArchive.delete({
        where: { id: archive.id },
      });
      deletedCount++;
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Failed to delete archive ${archive.id}: ${error.message}`,
      );
    }
  }

  console.log(`[${new Date().toISOString()}] Deleted ${deletedCount} archives`);
  return deletedCount;
}

async function generateRetentionReport() {
  const RETENTION_YEARS = 7;
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - RETENTION_YEARS);

  const [activeLogsCount, archivedLogsCount, logsOlderThan7Years, lastArchive] =
    await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLogArchive.count(),
      prisma.auditLog.count({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      }),
      prisma.auditLogArchive.findFirst({
        orderBy: { archivedAt: "desc" },
      }),
    ]);

  const retentionViolationLogs = logsOlderThan7Years;
  const isCompliant = retentionViolationLogs === 0;

  console.log(
    "\n╔══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║           AUDIT LOG RETENTION COMPLIANCE REPORT              ║",
  );
  console.log(
    "╠══════════════════════════════════════════════════════════════╣",
  );
  console.log(`║ Report Generated: ${new Date().toISOString()}`);
  console.log(`║ Retention Policy: ${RETENTION_YEARS} Years`);
  console.log(`║ Cutoff Date: ${cutoffDate.toISOString()}`);
  console.log(
    "╠══════════════════════════════════════════════════════════════╣",
  );
  console.log(
    `║ COMPLIANCE STATUS: ${isCompliant ? "✓ COMPLIANT" : "✗ NON-COMPLIANT"}`,
  );
  console.log(
    "╠══════════════════════════════════════════════════════════════╣",
  );
  console.log(
    `║ Active Logs Count:        ${String(activeLogsCount).padStart(12)}`,
  );
  console.log(
    `║ Archived Logs Count:      ${String(archivedLogsCount).padStart(12)}`,
  );
  console.log(
    `║ Logs Older Than ${RETENTION_YEARS} Years:   ${String(logsOlderThan7Years).padStart(12)}`,
  );
  console.log(
    `║ Violation Logs:           ${String(retentionViolationLogs).padStart(12)}`,
  );
  console.log(
    "╠══════════════════════════════════════════════════════════════╣",
  );
  console.log(
    `║ Last Archive Date: ${lastArchive ? lastArchive.archivedAt.toISOString() : "Never"}`,
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════╝",
  );

  if (!isCompliant) {
    console.log("\n⚠️  WARNING: Retention policy violation detected!");
    console.log(
      `   ${retentionViolationLogs} logs exceed the ${RETENTION_YEARS}-year retention policy.`,
    );
    console.log(
      "   Run the archive-logs script immediately to resolve this issue.",
    );
  }

  return {
    isCompliant,
    activeLogsCount,
    archivedLogsCount,
    logsOlderThan7Years,
    retentionViolationLogs,
  };
}

async function main() {
  const command = process.argv[2] || "archive";

  switch (command) {
    case "archive":
      await archiveOldLogs();
      break;
    case "cleanup":
      const maxAge = parseInt(process.argv[3]) || 10;
      await cleanupOldArchives(maxAge);
      break;
    case "report":
      await generateRetentionReport();
      break;
    default:
      console.log(
        "Usage: node archive-logs.js [archive|cleanup|report] [options]",
      );
      console.log("");
      console.log("Commands:");
      console.log("  archive    - Archive logs older than 7 years (default)");
      console.log(
        "  cleanup    - Delete archives older than specified years (default: 10)",
      );
      console.log("  report     - Generate retention compliance report");
      console.log("");
      console.log("Examples:");
      console.log("  node archive-logs.js archive");
      console.log("  node archive-logs.js cleanup 15");
      console.log("  node archive-logs.js report");
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

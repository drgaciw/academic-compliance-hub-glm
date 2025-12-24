import { auditLogArchiveManager } from "../src/audit-log-archive";
import { AgentType } from "@prisma/client";
import { prisma } from "@aah/database";

describe("Retention Compliance Tests", () => {
  let testTransferEvaluationId: string;

  beforeAll(async () => {
    testTransferEvaluationId = `retention-compliance-test-${Date.now()}`;
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany({
      where: { transferEvaluationId: testTransferEvaluationId },
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.auditLog.deleteMany({
      where: { transferEvaluationId: testTransferEvaluationId },
    });
  });

  describe("Retention Policy Enforcement", () => {
    test("should enforce 7-year retention policy", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "EIGHT_YEAR_OLD",
          timestamp: eightYearsAgo,
        },
      });

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "RECENT",
          timestamp: new Date(),
        },
      });

      const reportBefore = await auditLogArchiveManager.getRetentionReport(7);
      expect(reportBefore.complianceStatus).toBe("NON_COMPLIANT");

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const reportAfter = await auditLogArchiveManager.getRetentionReport(7);
      expect(reportAfter.complianceStatus).toBe("COMPLIANT");
    });

    test("should detect non-compliant state with old logs", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "OLD_LOG",
          timestamp: eightYearsAgo,
        },
      });

      const report = await auditLogArchiveManager.getRetentionReport(7);

      expect(report.complianceStatus).toBe("NON_COMPLIANT");
      expect(report.activeLogs).toBe(1);
    });

    test("should detect compliant state with no old logs", async () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "RECENT_LOG",
          timestamp: oneYearAgo,
        },
      });

      const report = await auditLogArchiveManager.getRetentionReport(7);

      expect(report.complianceStatus).toBe("COMPLIANT");
    });

    test("should detect warning state for logs near retention limit", async () => {
      const sixYears11MonthsAgo = new Date();
      sixYears11MonthsAgo.setFullYear(sixYears11MonthsAgo.getFullYear() - 7);
      sixYears11MonthsAgo.setMonth(sixYears11MonthsAgo.getMonth() + 1);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "NEAR_LIMIT_LOG",
          timestamp: sixYears11MonthsAgo,
        },
      });

      const report = await auditLogArchiveManager.getRetentionReport(7);

      expect(report.complianceStatus).toBe("WARNING");
    });
  });

  describe("Archive Deletion", () => {
    test("should delete archives older than specified age", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "ARCHIVE_DELETE_TEST",
          timestamp: eightYearsAgo,
        },
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const metadataBefore =
        await auditLogArchiveManager.getArchiveMetadataList();
      expect(metadataBefore.length).toBe(1);

      await auditLogArchiveManager.deleteArchivesOlderThan(10);

      const metadataAfter =
        await auditLogArchiveManager.getArchiveMetadataList();
      expect(metadataAfter.length).toBe(0);
    });

    test("should not delete archives within age limit", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "ARCHIVE_KEEP_TEST",
          timestamp: eightYearsAgo,
        },
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const metadataBefore =
        await auditLogArchiveManager.getArchiveMetadataList();
      expect(metadataBefore.length).toBe(1);

      await auditLogArchiveManager.deleteArchivesOlderThan(15);

      const metadataAfter =
        await auditLogArchiveManager.getArchiveMetadataList();
      expect(metadataAfter.length).toBe(1);
    });

    test("should create backup before deletion", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "BACKUP_TEST",
          timestamp: eightYearsAgo,
        },
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const result = await auditLogArchiveManager.deleteArchivesOlderThan(10);

      expect(result.deletedArchives.length).toBeGreaterThanOrEqual(1);
      expect(result.backupCreated).toBe(true);
    });
  });

  describe("Retention Report Generation", () => {
    test("should generate comprehensive retention report", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.createMany({
        data: [
          {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: "OLD_LOG_1",
            timestamp: eightYearsAgo,
          },
          {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: "OLD_LOG_2",
            timestamp: eightYearsAgo,
          },
          {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: "RECENT_LOG",
            timestamp: new Date(),
          },
        ],
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const report = await auditLogArchiveManager.getRetentionReport(7);

      expect(report.totalLogs).toBe(3);
      expect(report.activeLogs).toBe(1);
      expect(report.archivedLogs).toBe(2);
      expect(report.complianceStatus).toBe("COMPLIANT");
      expect(report.archiveDetails.length).toBeGreaterThanOrEqual(1);
      expect(report.oldestActiveLog).toBeDefined();
      expect(report.newestActiveLog).toBeDefined();
    });

    test("should report date ranges correctly", async () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      await prisma.auditLog.createMany({
        data: [
          {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: "OLDEST_ACTIVE",
            timestamp: twoYearsAgo,
          },
          {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: "NEWEST_ACTIVE",
            timestamp: oneYearAgo,
          },
        ],
      });

      const report = await auditLogArchiveManager.getRetentionReport(7);

      expect(report.oldestActiveLog).toBeDefined();
      expect(report.newestActiveLog).toBeDefined();
      expect(report.oldestActiveLog!.getTime()).toBeLessThanOrEqual(
        report.newestActiveLog!.getTime(),
      );
    });

    test("should include archive details in report", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "ARCHIVE_DETAIL_TEST",
          timestamp: eightYearsAgo,
        },
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const report = await auditLogArchiveManager.getRetentionReport(7);

      expect(report.archiveDetails).toBeDefined();
      expect(report.archiveDetails.length).toBeGreaterThanOrEqual(1);

      const archiveDetail = report.archiveDetails[0];
      expect(archiveDetail.archiveId).toBeDefined();
      expect(archiveDetail.logCount).toBe(1);
      expect(archiveDetail.startDate).toBeDefined();
      expect(archiveDetail.endDate).toBeDefined();
      expect(archiveDetail.compressedSize).toBeGreaterThan(0);
      expect(archiveDetail.uncompressedSize).toBeGreaterThan(0);
      expect(archiveDetail.checksum).toBeDefined();
    });

    test("should handle empty state in report", async () => {
      const report = await auditLogArchiveManager.getRetentionReport(7);

      expect(report.totalLogs).toBe(0);
      expect(report.activeLogs).toBe(0);
      expect(report.archivedLogs).toBe(0);
      expect(report.complianceStatus).toBe("COMPLIANT");
      expect(report.oldestActiveLog).toBeNull();
      expect(report.newestActiveLog).toBeNull();
      expect(report.archiveDetails).toEqual([]);
    });
  });

  describe("Archive Recovery", () => {
    test("should restore logs from archive", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "RECOVERY_TEST",
          inputData: { test: "data" } as any,
          outputData: { result: "success" } as any,
          duration: 100,
          timestamp: eightYearsAgo,
        },
      });

      const archiveResult =
        await auditLogArchiveManager.archiveLogsOlderThan(7);

      const activeLogsBefore = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
      });
      expect(activeLogsBefore.length).toBe(0);

      const restoreResult = await auditLogArchiveManager.restoreFromArchive(
        archiveResult.archiveId,
      );

      expect(restoreResult.restoredCount).toBe(1);

      const activeLogsAfter = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
      });
      expect(activeLogsAfter.length).toBe(1);
      expect(activeLogsAfter[0].action).toBe("RECOVERY_TEST");
    });

    test("should delete archive after restoration", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "DELETE_AFTER_RESTORE",
          timestamp: eightYearsAgo,
        },
      });

      const archiveResult =
        await auditLogArchiveManager.archiveLogsOlderThan(7);

      const metadataBefore =
        await auditLogArchiveManager.getArchiveMetadataList();
      expect(metadataBefore.length).toBe(1);

      await auditLogArchiveManager.restoreFromArchive(archiveResult.archiveId);

      const metadataAfter =
        await auditLogArchiveManager.getArchiveMetadataList();
      expect(metadataAfter.length).toBe(0);
    });

    test("should restore multiple logs from archive", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      const logCount = 10;
      for (let i = 0; i < logCount; i++) {
        await prisma.auditLog.create({
          data: {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: `MULTI_RECOVERY_${i}`,
            timestamp: eightYearsAgo,
          },
        });
      }

      const archiveResult =
        await auditLogArchiveManager.archiveLogsOlderThan(7);

      const restoreResult = await auditLogArchiveManager.restoreFromArchive(
        archiveResult.archiveId,
      );

      expect(restoreResult.restoredCount).toBe(logCount);

      const activeLogs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
      });
      expect(activeLogs.length).toBe(logCount);
    });
  });

  describe("Compliance Monitoring", () => {
    test("should track compliance over time", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "MONITOR_TEST",
          timestamp: eightYearsAgo,
        },
      });

      const report1 = await auditLogArchiveManager.getRetentionReport(7);
      expect(report1.complianceStatus).toBe("NON_COMPLIANT");

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const report2 = await auditLogArchiveManager.getRetentionReport(7);
      expect(report2.complianceStatus).toBe("COMPLIANT");
    });

    test("should report accurate archive counts", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      const archiveCounts = [5, 10, 7];
      for (let i = 0; i < archiveCounts.length; i++) {
        for (let j = 0; j < archiveCounts[i]; j++) {
          await prisma.auditLog.create({
            data: {
              transferEvaluationId: testTransferEvaluationId,
              agentType: AgentType.EVALUATION_AGENT,
              action: `ARCHIVE_COUNT_${i}_${j}`,
              timestamp: eightYearsAgo,
            },
          });
        }

        await auditLogArchiveManager.archiveLogsOlderThan(7);
      }

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "ACTIVE_LOG",
          timestamp: new Date(),
        },
      });

      const report = await auditLogArchiveManager.getRetentionReport(7);

      expect(report.activeLogs).toBe(1);
      expect(report.archivedLogs).toBe(
        archiveCounts.reduce((a, b) => a + b, 0),
      );
      expect(report.totalLogs).toBe(
        archiveCounts.reduce((a, b) => a + b, 0) + 1,
      );
    });
  });

  describe("Retention Period Variations", () => {
    test("should respect custom retention periods", async () => {
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "CUSTOM_RETENTION",
          timestamp: fiveYearsAgo,
        },
      });

      const report3Years = await auditLogArchiveManager.getRetentionReport(3);
      expect(report3Years.complianceStatus).toBe("NON_COMPLIANT");

      const report5Years = await auditLogArchiveManager.getRetentionReport(5);
      expect(report5Years.complianceStatus).toBe("COMPLIANT");
    });

    test("should archive based on custom retention period", async () => {
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "CUSTOM_ARCHIVE",
          timestamp: fiveYearsAgo,
        },
      });

      const archiveResult =
        await auditLogArchiveManager.archiveLogsOlderThan(3);

      expect(archiveResult.archivedCount).toBe(1);

      const activeLogs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
      });
      expect(activeLogs.length).toBe(0);
    });
  });
});

import { auditLogArchiveManager } from "../src/audit-log-archive";
import { AgentType } from "@prisma/client";
import { prisma } from "@aah/database";
import * as fs from "fs/promises";

describe("Archive Integrity Tests", () => {
  let testTransferEvaluationId: string;

  beforeAll(async () => {
    testTransferEvaluationId = `integrity-test-${Date.now()}`;
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

  describe("Archive Compression", () => {
    test("should compress archives correctly", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      const inputData = { testData: "A".repeat(1000) };
      const outputData = { resultData: "B".repeat(1000) };

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "COMPRESSION_TEST",
          inputData: inputData as any,
          outputData: outputData as any,
          errorMessage: "Test error",
          duration: 100,
          timestamp: eightYearsAgo,
        },
      });

      const result = await auditLogArchiveManager.archiveLogsOlderThan(7);

      expect(result.metadata.compressedSize).toBeGreaterThan(0);
      expect(result.metadata.uncompressedSize).toBeGreaterThan(0);
      expect(result.metadata.compressedSize).toBeLessThan(
        result.metadata.uncompressedSize,
      );
    });

    test("should achieve significant compression ratio", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      for (let i = 0; i < 50; i++) {
        await prisma.auditLog.create({
          data: {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: `COMPRESSION_BATCH_${i}`,
            inputData: {
              data: "Test data with repetitive content. ".repeat(10),
            } as any,
            outputData: { result: "Another test output. ".repeat(10) } as any,
            timestamp: eightYearsAgo,
          },
        });
      }

      const result = await auditLogArchiveManager.archiveLogsOlderThan(7);

      const compressionRatio =
        result.metadata.compressedSize / result.metadata.uncompressedSize;
      expect(compressionRatio).toBeLessThan(0.5);
    });

    test("should compress empty logs", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "MINIMAL_LOG",
          timestamp: eightYearsAgo,
        },
      });

      const result = await auditLogArchiveManager.archiveLogsOlderThan(7);

      expect(result.metadata.compressedSize).toBeGreaterThan(0);
      expect(result.metadata.logCount).toBe(1);
    });
  });

  describe("Checksum Verification", () => {
    test("should generate checksum for archive", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "CHECKSUM_TEST",
          timestamp: eightYearsAgo,
        },
      });

      const result = await auditLogArchiveManager.archiveLogsOlderThan(7);

      expect(result.metadata.checksum).toBeDefined();
      expect(result.metadata.checksum).toHaveLength(64);
      expect(result.metadata.checksum).toMatch(/^[a-f0-9]{64}$/);
    });

    test("should detect corrupted archives", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "CORRUPTION_TEST",
          timestamp: eightYearsAgo,
        },
      });

      const result = await auditLogArchiveManager.archiveLogsOlderThan(7);

      const metadataList =
        await auditLogArchiveManager.getArchiveMetadataList();
      const metadata = metadataList.find(
        (m) => m.archiveId === result.archiveId,
      );

      expect(metadata).toBeDefined();
      if (metadata) {
        const archives = await auditLogArchiveManager.verifyArchiveIntegrity(
          metadata.archiveId,
        );
        expect(archives.validArchives).toContain(metadata.archiveId);
        expect(archives.invalidArchives).toHaveLength(0);
      }
    });

    test("should validate multiple archives", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      for (let i = 0; i < 3; i++) {
        await prisma.auditLog.create({
          data: {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: `MULTI_ARCHIVE_${i}`,
            timestamp: eightYearsAgo,
          },
        });

        await auditLogArchiveManager.archiveLogsOlderThan(7);
      }

      const result = await auditLogArchiveManager.verifyArchiveIntegrity();

      expect(result.validArchives.length).toBeGreaterThanOrEqual(3);
      expect(result.invalidArchives).toHaveLength(0);
    });
  });

  describe("Archive Data Integrity", () => {
    test("should preserve log data through archive cycle", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      const inputData = {
        studentId: "STU001",
        courses: ["MATH101", "ENGL102"],
        credits: 6,
        gpa: 3.5,
      };

      const outputData = {
        eligible: true,
        requirements: ["2.5 GPA", "24 credits"],
        waived: [],
      };

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "DATA_INTEGRITY_TEST",
          inputData: inputData as any,
          outputData: outputData as any,
          errorMessage: null,
          duration: 1250,
          timestamp: eightYearsAgo,
        },
      });

      const archiveResult =
        await auditLogArchiveManager.archiveLogsOlderThan(7);
      const restoredLogs = await auditLogArchiveManager.loadArchive(
        archiveResult.archiveId,
      );

      expect(restoredLogs).toHaveLength(1);
      expect(restoredLogs[0].transferEvaluationId).toBe(
        testTransferEvaluationId,
      );
      expect(restoredLogs[0].agentType).toBe(AgentType.EVALUATION_AGENT);
      expect(restoredLogs[0].action).toBe("DATA_INTEGRITY_TEST");
      expect(restoredLogs[0].inputData).toEqual(inputData);
      expect(restoredLogs[0].outputData).toEqual(outputData);
      expect(restoredLogs[0].duration).toBe(1250);
      expect(restoredLogs[0].errorMessage).toBeNull();
      expect(restoredLogs[0].timestamp).toEqual(eightYearsAgo);
    });

    test("should preserve timestamps with millisecond precision", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);
      eightYearsAgo.setMilliseconds(123);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "TIMESTAMP_PRECISION",
          timestamp: eightYearsAgo,
        },
      });

      const archiveResult =
        await auditLogArchiveManager.archiveLogsOlderThan(7);
      const restoredLogs = await auditLogArchiveManager.loadArchive(
        archiveResult.archiveId,
      );

      expect(restoredLogs[0].timestamp.getMilliseconds()).toBe(123);
    });

    test("should preserve error messages", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      const errorMessage =
        "Validation failed: Missing required field 'studentId' in input data";

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "ERROR_MESSAGE_TEST",
          errorMessage,
          timestamp: eightYearsAgo,
        },
      });

      const archiveResult =
        await auditLogArchiveManager.archiveLogsOlderThan(7);
      const restoredLogs = await auditLogArchiveManager.loadArchive(
        archiveResult.archiveId,
      );

      expect(restoredLogs[0].errorMessage).toBe(errorMessage);
    });

    test("should preserve all agent types", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      const agentTypes = Object.values(AgentType);

      for (const agentType of agentTypes) {
        await prisma.auditLog.create({
          data: {
            transferEvaluationId: testTransferEvaluationId,
            agentType,
            action: `AGENT_TYPE_TEST_${agentType}`,
            timestamp: eightYearsAgo,
          },
        });
      }

      const archiveResult =
        await auditLogArchiveManager.archiveLogsOlderThan(7);
      const restoredLogs = await auditLogArchiveManager.loadArchive(
        archiveResult.archiveId,
      );

      expect(restoredLogs).toHaveLength(agentTypes.length);

      const restoredAgentTypes = new Set(
        restoredLogs.map((log) => log.agentType),
      );
      agentTypes.forEach((type) => {
        expect(restoredAgentTypes.has(type)).toBe(true);
      });
    });
  });

  describe("Archive Metadata Integrity", () => {
    test("should maintain accurate log count in metadata", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      const expectedCount = 25;
      for (let i = 0; i < expectedCount; i++) {
        await prisma.auditLog.create({
          data: {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: `METADATA_COUNT_${i}`,
            timestamp: eightYearsAgo,
          },
        });
      }

      const archiveResult =
        await auditLogArchiveManager.archiveLogsOlderThan(7);

      expect(archiveResult.metadata.logCount).toBe(expectedCount);
      expect(archiveResult.archivedCount).toBe(expectedCount);
    });

    test("should maintain accurate date range in metadata", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      const startDate = new Date(eightYearsAgo);
      startDate.setDate(startDate.getDate() - 5);

      const endDate = new Date(eightYearsAgo);
      endDate.setDate(endDate.getDate() + 5);

      for (let i = 0; i < 11; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        await prisma.auditLog.create({
          data: {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: `DATE_RANGE_${i}`,
            timestamp: date,
          },
        });
      }

      const archiveResult =
        await auditLogArchiveManager.archiveLogsOlderThan(7);

      expect(archiveResult.metadata.startDate).toEqual(startDate);
      expect(archiveResult.metadata.endDate).toEqual(endDate);
    });

    test("should track creation timestamp", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "CREATION_TIME_TEST",
          timestamp: eightYearsAgo,
        },
      });

      const beforeArchive = new Date();
      const archiveResult =
        await auditLogArchiveManager.archiveLogsOlderThan(7);
      const afterArchive = new Date();

      expect(archiveResult.metadata.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeArchive.getTime(),
      );
      expect(archiveResult.metadata.createdAt.getTime()).toBeLessThanOrEqual(
        afterArchive.getTime(),
      );
    });
  });
});

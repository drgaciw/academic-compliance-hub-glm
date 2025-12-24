import { auditLogArchiveManager } from "../src/audit-log-archive";
import { auditLogger } from "../src/audit-logger";
import { AgentType, Prisma } from "@prisma/client";
import { prisma } from "@aah/database";
import * as fs from "fs/promises";
import * as path from "path";

describe("Retention Policy Tests", () => {
  let testTransferEvaluationId: string;

  beforeAll(async () => {
    testTransferEvaluationId = `retention-test-${Date.now()}`;
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

  describe("7-Year Retention Policy", () => {
    test("should identify logs exactly 7 years old for archival", async () => {
      const sevenYearsAgo = new Date();
      sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);
      sevenYearsAgo.setHours(0, 0, 0, 0);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "SEVEN_YEAR_OLD_ACTION",
          timestamp: sevenYearsAgo,
        },
      });

      const logs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
      });

      expect(logs.length).toBe(1);
      expect(logs[0].timestamp).toEqual(sevenYearsAgo);
    });

    test("should keep logs from 7 years and 1 day old active", async () => {
      const sevenYearsOneDayAgo = new Date();
      sevenYearsOneDayAgo.setFullYear(sevenYearsOneDayAgo.getFullYear() - 7);
      sevenYearsOneDayAgo.setDate(sevenYearsOneDayAgo.getDate() - 1);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "SEVEN_YEAR_ONE_DAY_ACTION",
          timestamp: sevenYearsOneDayAgo,
        },
      });

      const logs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
      });

      expect(logs.length).toBe(1);
      expect(logs[0].timestamp).toEqual(sevenYearsOneDayAgo);
    });

    test("should archive logs older than 7 years", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);
      eightYearsAgo.setHours(0, 0, 0, 0);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "EIGHT_YEAR_OLD_ACTION",
          timestamp: eightYearsAgo,
        },
      });

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "RECENT_ACTION",
          timestamp: new Date(),
        },
      });

      const result = await auditLogArchiveManager.archiveLogsOlderThan(7);

      expect(result.archivedCount).toBe(1);
      expect(result.archiveId).toBeDefined();

      const activeLogs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
      });

      expect(activeLogs.length).toBe(1);
      expect(activeLogs[0].action).toBe("RECENT_ACTION");
    });

    test("should not archive logs exactly at 7-year boundary", async () => {
      const sevenYearsAgo = new Date();
      sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);
      sevenYearsAgo.setHours(0, 0, 0, 0);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "BOUNDARY_ACTION",
          timestamp: sevenYearsAgo,
        },
      });

      const result = await auditLogArchiveManager.archiveLogsOlderThan(7);

      expect(result.archivedCount).toBe(0);

      const logs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
      });

      expect(logs.length).toBe(1);
    });

    test("should handle multiple logs in same archive", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      for (let i = 0; i < 10; i++) {
        const logDate = new Date(eightYearsAgo);
        logDate.setDate(logDate.getDate() + i);

        await prisma.auditLog.create({
          data: {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: `MULTIPLE_LOG_ACTION_${i}`,
            timestamp: logDate,
          },
        });
      }

      const result = await auditLogArchiveManager.archiveLogsOlderThan(7);

      expect(result.archivedCount).toBe(10);
      expect(result.metadata.logCount).toBe(10);
    });

    test("should respect different retention periods", async () => {
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "FIVE_YEAR_ACTION",
          timestamp: fiveYearsAgo,
        },
      });

      const result = await auditLogArchiveManager.archiveLogsOlderThan(3);

      expect(result.archivedCount).toBe(1);

      const result5Years = await auditLogArchiveManager.archiveLogsOlderThan(5);

      expect(result5Years.archivedCount).toBe(0);
    });
  });

  describe("Archival Logic", () => {
    test("should create archive with correct metadata", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "METADATA_TEST_ACTION",
          inputData: { test: "data" },
          outputData: { result: "success" },
          timestamp: eightYearsAgo,
        },
      });

      const result = await auditLogArchiveManager.archiveLogsOlderThan(7);

      expect(result.metadata).toBeDefined();
      expect(result.metadata.archiveId).toBeDefined();
      expect(result.metadata.logCount).toBe(1);
      expect(result.metadata.compressedSize).toBeGreaterThan(0);
      expect(result.metadata.uncompressedSize).toBeGreaterThan(0);
      expect(result.metadata.checksum).toBeDefined();
      expect(result.metadata.startDate).toEqual(eightYearsAgo);
      expect(result.metadata.endDate).toEqual(eightYearsAgo);
    });

    test("should generate unique archive IDs", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "UNIQUE_ID_1",
          timestamp: eightYearsAgo,
        },
      });

      const result1 = await auditLogArchiveManager.archiveLogsOlderThan(7);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "UNIQUE_ID_2",
          timestamp: eightYearsAgo,
        },
      });

      const result2 = await auditLogArchiveManager.archiveLogsOlderThan(7);

      expect(result1.archiveId).not.toBe(result2.archiveId);
    });

    test("should return zero archived when no old logs exist", async () => {
      const result = await auditLogArchiveManager.archiveLogsOlderThan(7);

      expect(result.archivedCount).toBe(0);
    });
  });

  describe("Date Range Queries", () => {
    beforeEach(async () => {
      const dates = [
        { years: 8, days: 0, action: "EIGHT_YEARS" },
        { years: 7, days: 0, action: "SEVEN_YEARS" },
        { years: 7, days: 1, action: "SEVEN_YEARS_ONE_DAY" },
        { years: 6, days: 0, action: "SIX_YEARS" },
        { years: 5, days: 0, action: "FIVE_YEARS" },
        { years: 1, days: 0, action: "ONE_YEAR" },
        { years: 0, days: 0, action: "TODAY" },
      ];

      for (const { years, days, action } of dates) {
        const date = new Date();
        date.setFullYear(date.getFullYear() - years);
        date.setDate(date.getDate() - days);

        await prisma.auditLog.create({
          data: {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action,
            timestamp: date,
          },
        });
      }
    });

    test("should query logs by date range correctly", async () => {
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 6);

      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() - 5);

      const logs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
        startDate,
        endDate,
      });

      expect(logs.length).toBeGreaterThanOrEqual(1);
      logs.forEach((log) => {
        expect(log.timestamp.getTime()).toBeGreaterThanOrEqual(
          startDate.getTime(),
        );
        expect(log.timestamp.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });

    test("should query logs older than specific date", async () => {
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);

      const logs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
        endDate: cutoffDate,
      });

      expect(logs.length).toBeGreaterThanOrEqual(2);
      logs.forEach((log) => {
        expect(log.timestamp.getTime()).toBeLessThanOrEqual(
          cutoffDate.getTime(),
        );
      });
    });

    test("should query logs newer than specific date", async () => {
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);

      const logs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
        startDate: cutoffDate,
      });

      logs.forEach((log) => {
        expect(log.timestamp.getTime()).toBeGreaterThanOrEqual(
          cutoffDate.getTime(),
        );
      });
    });
  });
});

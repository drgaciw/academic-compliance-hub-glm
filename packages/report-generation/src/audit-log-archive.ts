import { prisma } from "@aah/database";
import { AgentType } from "@prisma/client";
import type { AuditLog } from "@prisma/client";
import * as fs from "fs/promises";
import * as path from "path";
import * as zlib from "zlib";
import { promisify } from "util";

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export interface ArchiveMetadata {
  archiveId: string;
  startDate: Date;
  endDate: Date;
  logCount: number;
  compressedSize: number;
  uncompressedSize: number;
  checksum: string;
  createdAt: Date;
}

export interface ArchiveSearchOptions {
  startDate?: Date;
  endDate?: Date;
  agentType?: AgentType | AgentType[];
  action?: string;
  transferEvaluationId?: string;
}

export interface RetentionReport {
  totalLogs: number;
  activeLogs: number;
  archivedLogs: number;
  oldestActiveLog: Date | null;
  newestActiveLog: Date | null;
  archiveDetails: ArchiveMetadata[];
  complianceStatus: "COMPLIANT" | "NON_COMPLIANT" | "WARNING";
}

const ARCHIVE_DIR =
  process.env.AUDIT_ARCHIVE_DIR || path.join(process.cwd(), "archives");

class AuditLogArchiveManager {
  private archiveDir: string;

  constructor(archiveDir?: string) {
    this.archiveDir = archiveDir || ARCHIVE_DIR;
  }

  async initializeArchiveDirectory(): Promise<void> {
    try {
      await fs.access(this.archiveDir);
    } catch {
      await fs.mkdir(this.archiveDir, { recursive: true });
    }
  }

  async archiveLogsOlderThan(retentionYears: number = 7): Promise<{
    archivedCount: number;
    archiveId: string;
    metadata: ArchiveMetadata;
  }> {
    await this.initializeArchiveDirectory();

    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - retentionYears);
    cutoffDate.setHours(0, 0, 0, 0);

    const logsToArchive = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
      orderBy: { timestamp: "asc" },
    });

    if (logsToArchive.length === 0) {
      return {
        archivedCount: 0,
        archiveId: "",
        metadata: {} as ArchiveMetadata,
      };
    }

    const archiveId = `audit-archive-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const archiveContent = JSON.stringify(logsToArchive, null, 2);
    const uncompressedSize = Buffer.byteLength(archiveContent, "utf8");

    const compressed = await gzip(archiveContent);
    const compressedSize = compressed.length;

    const checksum = this.calculateChecksum(compressed);

    const metadata: ArchiveMetadata = {
      archiveId,
      startDate: logsToArchive[0].timestamp,
      endDate: logsToArchive[logsToArchive.length - 1].timestamp,
      logCount: logsToArchive.length,
      compressedSize,
      uncompressedSize,
      checksum,
      createdAt: new Date(),
    };

    const archivePath = path.join(this.archiveDir, `${archiveId}.json.gz`);
    await fs.writeFile(archivePath, compressed);

    await fs.writeFile(
      path.join(this.archiveDir, `${archiveId}.metadata.json`),
      JSON.stringify(metadata, null, 2),
    );

    await prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    return {
      archivedCount: logsToArchive.length,
      archiveId,
      metadata,
    };
  }

  async getActiveLogs(options: ArchiveSearchOptions = {}): Promise<AuditLog[]> {
    const { startDate, endDate, agentType, action, transferEvaluationId } =
      options;

    const where: any = {};

    if (transferEvaluationId) {
      where.transferEvaluationId = transferEvaluationId;
    }

    if (agentType) {
      where.agentType = Array.isArray(agentType)
        ? { in: agentType }
        : agentType;
    }

    if (action) {
      where.action = { contains: action, mode: "insensitive" };
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = startDate;
      }
      if (endDate) {
        where.timestamp.lte = endDate;
      }
    }

    return prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
    });
  }

  async searchArchives(
    options: ArchiveSearchOptions = {},
  ): Promise<AuditLog[]> {
    await this.initializeArchiveDirectory();

    const files = await fs.readdir(this.archiveDir);
    const metadataFiles = files.filter((f) => f.endsWith(".metadata.json"));

    const allLogs: AuditLog[] = [];

    for (const metadataFile of metadataFiles) {
      const metadataPath = path.join(this.archiveDir, metadataFile);
      const metadataContent = await fs.readFile(metadataPath, "utf8");
      const metadata: ArchiveMetadata = JSON.parse(metadataContent);

      let shouldSearch = true;

      if (options.startDate && metadata.endDate < options.startDate) {
        shouldSearch = false;
      }

      if (options.endDate && metadata.startDate > options.endDate) {
        shouldSearch = false;
      }

      if (shouldSearch) {
        const logs = await this.loadArchive(metadata.archiveId);
        const filtered = this.filterLogs(logs, options);
        allLogs.push(...filtered);
      }
    }

    return allLogs.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }

  async loadArchive(archiveId: string): Promise<AuditLog[]> {
    const archivePath = path.join(this.archiveDir, `${archiveId}.json.gz`);
    const metadataPath = path.join(
      this.archiveDir,
      `${archiveId}.metadata.json`,
    );

    const compressed = await fs.readFile(archivePath);
    const decompressed = await gunzip(compressed);
    const logs: AuditLog[] = JSON.parse(decompressed.toString("utf8"));

    const metadataContent = await fs.readFile(metadataPath, "utf8");
    const metadata: ArchiveMetadata = JSON.parse(metadataContent);

    const actualChecksum = this.calculateChecksum(compressed);
    if (actualChecksum !== metadata.checksum) {
      throw new Error(`Archive ${archiveId} integrity check failed`);
    }

    return logs.map((log) => ({
      ...log,
      timestamp: new Date(log.timestamp),
    }));
  }

  async verifyArchiveIntegrity(archiveId?: string): Promise<{
    validArchives: string[];
    invalidArchives: string[];
  }> {
    await this.initializeArchiveDirectory();

    const files = await fs.readdir(this.archiveDir);
    const metadataFiles = files.filter((f) => f.endsWith(".metadata.json"));

    const validArchives: string[] = [];
    const invalidArchives: string[] = [];

    if (archiveId) {
      try {
        await this.loadArchive(archiveId);
        validArchives.push(archiveId);
      } catch (error) {
        invalidArchives.push(archiveId);
      }
    } else {
      for (const metadataFile of metadataFiles) {
        const archiveId = metadataFile.replace(".metadata.json", "");
        try {
          await this.loadArchive(archiveId);
          validArchives.push(archiveId);
        } catch (error) {
          invalidArchives.push(archiveId);
        }
      }
    }

    return { validArchives, invalidArchives };
  }

  async getRetentionReport(
    retentionYears: number = 7,
  ): Promise<RetentionReport> {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - retentionYears);

    const activeLogs = await this.getActiveLogs();
    const archiveDetails = await this.getArchiveMetadataList();

    const oldestLog = await prisma.auditLog.findFirst({
      orderBy: { timestamp: "asc" },
    });

    const newestLog = await prisma.auditLog.findFirst({
      orderBy: { timestamp: "desc" },
    });

    const archivedLogsCount = archiveDetails.reduce(
      (sum, meta) => sum + meta.logCount,
      0,
    );

    const totalLogs = activeLogs.length + archivedLogsCount;

    const oldestActiveLog = oldestLog ? oldestLog.timestamp : null;
    const newestActiveLog = newestLog ? newestLog.timestamp : null;

    let complianceStatus: RetentionReport["complianceStatus"] = "COMPLIANT";
    if (oldestActiveLog && oldestActiveLog < cutoffDate) {
      complianceStatus = "NON_COMPLIANT";
    } else if (
      oldestActiveLog &&
      new Date(oldestActiveLog.getTime() - 30 * 24 * 60 * 60 * 1000) <
        cutoffDate
    ) {
      complianceStatus = "WARNING";
    }

    return {
      totalLogs,
      activeLogs: activeLogs.length,
      archivedLogs: archivedLogsCount,
      oldestActiveLog,
      newestActiveLog,
      archiveDetails,
      complianceStatus,
    };
  }

  async deleteArchivesOlderThan(maxAgeInYears: number): Promise<{
    deletedArchives: string[];
    backupCreated: boolean;
  }> {
    await this.initializeArchiveDirectory();

    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - maxAgeInYears);

    const metadataFiles = await fs.readdir(this.archiveDir);
    const toDelete: string[] = [];

    for (const file of metadataFiles) {
      if (!file.endsWith(".metadata.json")) continue;

      const metadataPath = path.join(this.archiveDir, file);
      const content = await fs.readFile(metadataPath, "utf8");
      const metadata: ArchiveMetadata = JSON.parse(content);

      if (metadata.startDate < cutoffDate) {
        toDelete.push(metadata.archiveId);
      }
    }

    let backupCreated = false;
    if (toDelete.length > 0) {
      const backupPath = path.join(
        this.archiveDir,
        `backup-${Date.now()}.tar.gz`,
      );
      backupCreated = await this.createBackup(toDelete, backupPath);

      for (const archiveId of toDelete) {
        const archiveFile = path.join(this.archiveDir, `${archiveId}.json.gz`);
        const metadataFile = path.join(
          this.archiveDir,
          `${archiveId}.metadata.json`,
        );

        await fs.unlink(archiveFile).catch(() => {});
        await fs.unlink(metadataFile).catch(() => {});
      }
    }

    return { deletedArchives: toDelete, backupCreated };
  }

  async restoreFromArchive(
    archiveId: string,
  ): Promise<{ restoredCount: number; archiveId: string }> {
    const logs = await this.loadArchive(archiveId);

    for (const log of logs) {
      await prisma.auditLog
        .create({
          data: {
            transferEvaluationId: log.transferEvaluationId,
            agentType: log.agentType,
            action: log.action,
            inputData: log.inputData as any,
            outputData: log.outputData as any,
            errorMessage: log.errorMessage,
            duration: log.duration,
            timestamp: log.timestamp,
          },
        })
        .catch(() => {});
    }

    const archivePath = path.join(this.archiveDir, `${archiveId}.json.gz`);
    const metadataPath = path.join(
      this.archiveDir,
      `${archiveId}.metadata.json`,
    );

    await fs.unlink(archivePath).catch(() => {});
    await fs.unlink(metadataPath).catch(() => {});

    return { restoredCount: logs.length, archiveId };
  }

  async getArchiveMetadataList(): Promise<ArchiveMetadata[]> {
    await this.initializeArchiveDirectory();

    const files = await fs.readdir(this.archiveDir);
    const metadataFiles = files.filter((f) => f.endsWith(".metadata.json"));

    const metadata: ArchiveMetadata[] = [];

    for (const file of metadataFiles) {
      const metadataPath = path.join(this.archiveDir, file);
      const content = await fs.readFile(metadataPath, "utf8");
      const parsed = JSON.parse(content);
      parsed.startDate = new Date(parsed.startDate);
      parsed.endDate = new Date(parsed.endDate);
      parsed.createdAt = new Date(parsed.createdAt);
      metadata.push(parsed);
    }

    return metadata.sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime(),
    );
  }

  private filterLogs(
    logs: AuditLog[],
    options: ArchiveSearchOptions,
  ): AuditLog[] {
    let filtered = logs;

    if (options.transferEvaluationId) {
      filtered = filtered.filter(
        (log) => log.transferEvaluationId === options.transferEvaluationId,
      );
    }

    if (options.agentType) {
      const types = Array.isArray(options.agentType)
        ? options.agentType
        : [options.agentType];
      filtered = filtered.filter((log) => types.includes(log.agentType));
    }

    if (options.action) {
      filtered = filtered.filter((log) =>
        log.action.toLowerCase().includes(options.action!.toLowerCase()),
      );
    }

    if (options.startDate) {
      filtered = filtered.filter((log) => log.timestamp >= options.startDate!);
    }

    if (options.endDate) {
      filtered = filtered.filter((log) => log.timestamp <= options.endDate!);
    }

    return filtered;
  }

  private calculateChecksum(buffer: Buffer): string {
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  private async createBackup(
    archiveIds: string[],
    backupPath: string,
  ): Promise<boolean> {
    try {
      const archiver = require("archiver");
      const output = require("fs").createWriteStream(backupPath);

      const archive = archiver("tar", {
        gzip: true,
      });

      return new Promise((resolve) => {
        output.on("close", () => resolve(true));
        archive.on("error", () => resolve(false));

        archive.pipe(output);

        for (const archiveId of archiveIds) {
          const archiveFile = path.join(
            this.archiveDir,
            `${archiveId}.json.gz`,
          );
          const metadataFile = path.join(
            this.archiveDir,
            `${archiveId}.metadata.json`,
          );
          archive.file(archiveFile, { name: `${archiveId}.json.gz` });
          archive.file(metadataFile, { name: `${archiveId}.metadata.json` });
        }

        archive.finalize();
      });
    } catch {
      return false;
    }
  }
}

export const auditLogArchiveManager = new AuditLogArchiveManager();

export default auditLogArchiveManager;

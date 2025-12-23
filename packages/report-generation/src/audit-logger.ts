import { prisma } from "@aah/database";
import { AgentType } from "@prisma/client";
import type { AuditLog } from "@prisma/client";

export interface AuditLogEntry {
  transferEvaluationId: string;
  agentType: AgentType;
  action: string;
  inputData?: any;
  outputData?: any;
  errorMessage?: string;
  duration?: number;
}

export interface AuditLogQueryOptions {
  transferEvaluationId?: string;
  agentType?: AgentType | AgentType[];
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditLogSummary {
  totalLogs: number;
  logsByAgentType: Record<AgentType, number>;
  logsByAction: Record<string, number>;
  averageDuration: number;
  errorCount: number;
  successCount: number;
}

export interface FerpaComplianceLog {
  userId: string;
  action: "VIEW" | "EXPORT" | "MODIFY" | "DELETE";
  dataType:
    | "STUDENT_PROFILE"
    | "TRANSCRIPT"
    | "EVALUATION"
    | "COURSE_MAPPING"
    | "COMPLIANCE_RECORD";
  studentId: string;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
}

interface FerpaActionData extends Omit<FerpaComplianceLog, "userId"> {}

class AuditLogger {
  async logAction(entry: AuditLogEntry): Promise<AuditLog> {
    const startTime = Date.now();

    const auditLog = await prisma.auditLog.create({
      data: {
        transferEvaluationId: entry.transferEvaluationId,
        agentType: entry.agentType,
        action: entry.action,
        inputData: entry.inputData,
        outputData: entry.outputData,
        errorMessage: entry.errorMessage,
        duration: entry.duration ?? Date.now() - startTime,
      },
    });

    return auditLog;
  }

  async logWithLatency<T>(
    transferEvaluationId: string,
    agentType: AgentType,
    action: string,
    fn: () => Promise<{ inputData?: any; outputData: T }>,
  ): Promise<{ result: T; auditLog: AuditLog }> {
    const startTime = Date.now();
    let inputData: any;
    let outputData: T;
    let errorMessage: string | undefined;

    try {
      const { inputData: inData, outputData: outData } = await fn();
      inputData = inData;
      outputData = outData;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
      throw error;
    }

    const duration = Date.now() - startTime;
    const auditLog = await this.logAction({
      transferEvaluationId,
      agentType,
      action,
      inputData,
      outputData,
      errorMessage,
      duration,
    });

    return { result: outputData!, auditLog };
  }

  async queryLogs(options: AuditLogQueryOptions = {}): Promise<AuditLog[]> {
    const {
      transferEvaluationId,
      agentType,
      action,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
    } = options;

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
      take: limit,
      skip: offset,
    });
  }

  async getLogsByEvaluationId(
    transferEvaluationId: string,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    return this.queryLogs({ transferEvaluationId, limit });
  }

  async getLogsByAgentType(
    agentType: AgentType | AgentType[],
    limit: number = 100,
  ): Promise<AuditLog[]> {
    return this.queryLogs({ agentType, limit });
  }

  async getLogsByDateRange(
    startDate: Date,
    endDate: Date,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    return this.queryLogs({ startDate, endDate, limit });
  }

  async getLogSummary(
    options: Omit<AuditLogQueryOptions, "limit" | "offset"> = {},
  ): Promise<AuditLogSummary> {
    const logs = await this.queryLogs({ ...options, limit: 10000 });

    const logsByAgentType: Record<AgentType, number> = {} as Record<
      AgentType,
      number
    >;
    const logsByAction: Record<string, number> = {};
    let totalDuration = 0;
    let errorCount = 0;
    let successCount = 0;

    Object.values(AgentType).forEach((type) => {
      logsByAgentType[type as AgentType] = 0;
    });

    logs.forEach((log) => {
      logsByAgentType[log.agentType]++;
      logsByAction[log.action] = (logsByAction[log.action] || 0) + 1;

      if (log.duration) {
        totalDuration += log.duration;
      }

      if (log.errorMessage) {
        errorCount++;
      } else {
        successCount++;
      }
    });

    const averageDuration = logs.length > 0 ? totalDuration / logs.length : 0;

    return {
      totalLogs: logs.length,
      logsByAgentType,
      logsByAction,
      averageDuration,
      errorCount,
      successCount,
    };
  }

  async logEligibilityEvaluation(
    transferEvaluationId: string,
    inputData: any,
    outputData: any,
    duration?: number,
  ): Promise<AuditLog> {
    return this.logAction({
      transferEvaluationId,
      agentType: AgentType.EVALUATION_AGENT,
      action: "ELIGIBILITY_EVALUATION",
      inputData,
      outputData,
      duration,
    });
  }

  async logComplianceCheck(
    transferEvaluationId: string,
    inputData: any,
    outputData: any,
    duration?: number,
  ): Promise<AuditLog> {
    return this.logAction({
      transferEvaluationId,
      agentType: AgentType.COMPLIANCE_AGENT,
      action: "COMPLIANCE_CHECK",
      inputData,
      outputData,
      duration,
    });
  }

  async logDocumentProcessing(
    transferEvaluationId: string,
    inputData: any,
    outputData: any,
    duration?: number,
  ): Promise<AuditLog> {
    return this.logAction({
      transferEvaluationId,
      agentType: AgentType.DOCUMENT_AGENT,
      action: "DOCUMENT_PROCESSING",
      inputData,
      outputData,
      duration,
    });
  }

  async logRuleApplication(
    transferEvaluationId: string,
    inputData: any,
    outputData: any,
    duration?: number,
  ): Promise<AuditLog> {
    return this.logAction({
      transferEvaluationId,
      agentType: AgentType.RULE_ENGINE,
      action: "RULE_APPLICATION",
      inputData,
      outputData,
      duration,
    });
  }

  async logNotification(
    transferEvaluationId: string,
    inputData: any,
    outputData: any,
    duration?: number,
  ): Promise<AuditLog> {
    return this.logAction({
      transferEvaluationId,
      agentType: AgentType.NOTIFICATION_AGENT,
      action: "NOTIFICATION_SENT",
      inputData,
      outputData,
      duration,
    });
  }

  async logAdvisorAction(
    transferEvaluationId: string,
    action: string,
    inputData: any,
    outputData: any,
    duration?: number,
  ): Promise<AuditLog> {
    return this.logAction({
      transferEvaluationId,
      agentType: AgentType.ADVISOR_AGENT,
      action,
      inputData,
      outputData,
      duration,
    });
  }

  async logReportGeneration(
    transferEvaluationId: string,
    reportType: string,
    inputData: any,
    outputData: any,
    duration?: number,
  ): Promise<AuditLog> {
    return this.logAction({
      transferEvaluationId,
      agentType: AgentType.COMPLIANCE_AGENT,
      action: `REPORT_GENERATION:${reportType}`,
      inputData,
      outputData,
      duration,
    });
  }

  async logComplianceOverride(
    transferEvaluationId: string,
    inputData: any,
    outputData: any,
    duration?: number,
  ): Promise<AuditLog> {
    return this.logAction({
      transferEvaluationId,
      agentType: AgentType.COMPLIANCE_AGENT,
      action: "COMPLIANCE_OVERRIDE",
      inputData,
      outputData,
      duration,
    });
  }

  async logUserAction(
    userId: string,
    action: FerpaActionData,
    transferEvaluationId?: string,
  ): Promise<AuditLog> {
    return this.logAction({
      transferEvaluationId: transferEvaluationId || "",
      agentType: AgentType.ADVISOR_AGENT,
      action: `USER_ACTION:${action.action}`,
      inputData: {
        userId,
        dataType: action.dataType,
        studentId: action.studentId,
        reason: action.reason,
        ipAddress: action.ipAddress,
        userAgent: action.userAgent,
      },
      outputData: { success: true },
    });
  }

  async logStudentDataAccess(
    userId: string,
    studentId: string,
    dataType: FerpaComplianceLog["dataType"],
    reason: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.logUserAction(userId, {
      action: "VIEW",
      dataType,
      studentId,
      reason,
      ipAddress,
      userAgent,
    });
  }

  async logStudentDataExport(
    userId: string,
    studentId: string,
    dataType: FerpaComplianceLog["dataType"],
    reason: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.logUserAction(userId, {
      action: "EXPORT",
      dataType,
      studentId,
      reason,
      ipAddress,
      userAgent,
    });
  }

  async logStudentDataModification(
    userId: string,
    studentId: string,
    dataType: FerpaComplianceLog["dataType"],
    reason: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.logUserAction(userId, {
      action: "MODIFY",
      dataType,
      studentId,
      reason,
      ipAddress,
      userAgent,
    });
  }

  async deleteOldLogs(retentionYears: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - retentionYears);

    const result = await prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }

  async getLogsForExport(
    transferEvaluationId: string,
    limit: number = 1000,
  ): Promise<AuditLog[]> {
    return this.getLogsByEvaluationId(transferEvaluationId, limit);
  }

  async exportLogsToJSON(
    transferEvaluationId: string,
    limit: number = 1000,
  ): Promise<string> {
    const logs = await this.getLogsForExport(transferEvaluationId, limit);
    return JSON.stringify(logs, null, 2);
  }

  async verifyLogIntegrity(transferEvaluationId: string): Promise<boolean> {
    const logs = await this.getLogsByEvaluationId(transferEvaluationId, 1000);

    const sortedByTimestamp = [...logs].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    const isSequential = logs.every(
      (log, index) =>
        log.timestamp.getTime() ===
        sortedByTimestamp[index].timestamp.getTime(),
    );

    return isSequential;
  }
}

export const auditLogger = new AuditLogger();

export default auditLogger;

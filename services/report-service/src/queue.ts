import Queue from "bull";
import { ReportJob, ReportStatus } from "./types";

const REPORT_QUEUE_NAME = "report-generation";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let reportQueue: Queue.Queue<ReportJob> | null = null;

export function getReportQueue(): Queue.Queue<ReportJob> {
  if (!reportQueue) {
    reportQueue = new Queue<ReportJob>(REPORT_QUEUE_NAME, REDIS_URL, {
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    });
  }
  return reportQueue;
}

export async function addReportJob(
  jobData: Omit<ReportJob, "id" | "progress" | "createdAt">,
): Promise<ReportJob> {
  const queue = getReportQueue();

  const job = await queue.add("generate-report", {
    ...jobData,
    id: crypto.randomUUID(),
    progress: 0,
    createdAt: new Date(),
  });

  return {
    id: String(job.id),
    ...jobData,
    progress: 0,
    createdAt: new Date(),
  };
}

export async function getReportJob(jobId: string): Promise<ReportJob | null> {
  const queue = getReportQueue();
  const job = await queue.getJob(jobId);

  if (!job) {
    return null;
  }

  const state = await job.getState();
  let status: ReportStatus;

  switch (state) {
    case "waiting":
    case "delayed":
      status = ReportStatus.PENDING;
      break;
    case "active":
      status = ReportStatus.PROCESSING;
      break;
    case "completed":
      status = ReportStatus.COMPLETED;
      break;
    case "failed":
      status = ReportStatus.FAILED;
      break;
    default:
      status = ReportStatus.PENDING;
  }

  const progress = job.progress();

  return {
    id: String(job.id),
    type: job.data.type,
    format: job.data.format,
    status,
    data: job.data.data,
    userId: job.data.userId,
    studentId: job.data.studentId,
    templateId: job.data.templateId,
    outputPath: job.data.outputPath,
    error: job.failedReason,
    progress: typeof progress === "number" ? progress : 0,
    createdAt: new Date(job.timestamp),
    startedAt: job.processedOn ? new Date(job.processedOn) : undefined,
    completedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
    expiresAt: job.data.expiresAt,
  };
}

export async function updateJobProgress(
  jobId: string,
  progress: number,
): Promise<void> {
  const queue = getReportQueue();
  const job = await queue.getJob(jobId);

  if (job) {
    await job.progress(progress);
  }
}

export async function markJobCompleted(
  jobId: string,
  outputPath: string,
): Promise<void> {
  const queue = getReportQueue();
  const job = await queue.getJob(jobId);

  if (job) {
    await job.progress(100);
  }
}

export async function markJobFailed(
  jobId: string,
  error: string,
): Promise<void> {
  const queue = getReportQueue();
  const job = await queue.getJob(jobId);

  if (job) {
    await job.moveToFailed({ message: error });
  }
}

export async function deleteReportJob(jobId: string): Promise<boolean> {
  const queue = getReportQueue();
  const job = await queue.getJob(jobId);

  if (job) {
    await job.remove();
    return true;
  }

  return false;
}

export async function cleanupExpiredJobs(): Promise<number> {
  const queue = getReportQueue();
  const now = new Date();
  let cleanedCount = 0;

  const jobs = await queue.getRepeatableJobs();
  for (const job of jobs) {
    const expiresAt = job.next ? new Date(job.next) : undefined;
    if (expiresAt && expiresAt < now) {
      await queue.removeRepeatableByKey(job.key);
      cleanedCount++;
    }
  }

  return cleanedCount;
}

export async function getQueueStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const queue = getReportQueue();

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaiting(),
    queue.getActive(),
    queue.getCompleted(),
    queue.getFailed(),
    queue.getDelayed(),
  ]);

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    delayed: delayed.length,
  };
}

import { router } from "../init";
import { advisingRouter } from "./advising";
import { complianceRouter } from "./compliance";
import { documentsRouter } from "./documents";
import { courseMappingRouter } from "./course-mapping";
import { reportServiceRouter } from "./report-service";
import { notificationsRouter } from "./notifications";

export const appRouter = router({
  advising: advisingRouter,
  compliance: complianceRouter,
  documents: documentsRouter,
  courseMapping: courseMappingRouter,
  reportService: reportServiceRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;

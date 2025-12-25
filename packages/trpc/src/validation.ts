import { z } from "zod";

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export const searchSchema = z.object({
  query: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const studentFilterSchema = z.object({
  sport: z.string().optional(),
  year: z.number().min(1).max(6).optional(),
  eligibility: z.boolean().optional(),
});

export const courseFilterSchema = z.object({
  department: z.string().optional(),
  semester: z.string().optional(),
  year: z.number().optional(),
  status: z
    .enum(["IN_PROGRESS", "COMPLETED", "DROPPED", "WITHDRAWN"])
    .optional(),
});

export const complianceFilterSchema = z.object({
  status: z
    .enum(["ELIGIBLE", "INELIGIBLE", "PENDING", "UNDER_REVIEW", "CONDITIONAL"])
    .optional(),
  category: z.string().optional(),
});

export const advisorFilterSchema = z.object({
  sport: z.string().optional(),
  caseload: z.number().optional(),
});

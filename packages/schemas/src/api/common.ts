import { z } from "zod";
import { ResponseSchema } from "../base";

export const FilterSchema = z.object({
  field: z.string(),
  operator: z.enum(["eq", "ne", "gt", "gte", "lt", "lte", "in", "contains"]),
  value: z.any(),
});

export type Filter = z.infer<typeof FilterSchema>;

export const SortSchema = z.object({
  field: z.string(),
  order: z.enum(["asc", "desc"]),
});

export type Sort = z.infer<typeof SortSchema>;

export const QueryParamsSchema = z.object({
  filters: z.array(FilterSchema).optional(),
  sort: z.array(SortSchema).optional(),
  search: z.string().optional(),
});

export type QueryParams = z.infer<typeof QueryParamsSchema>;

export const ListQuerySchema = QueryParamsSchema.extend({
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
  }),
});

export type ListQuery = z.infer<typeof ListQuerySchema>;

export const BulkActionInputSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(["delete", "archive", "restore", "update"]),
  data: z.record(z.any()).optional(),
});

export type BulkActionInput = z.infer<typeof BulkActionInputSchema>;

export const BulkActionResponseSchema = ResponseSchema(
  z.object({
    succeeded: z.number(),
    failed: z.number(),
    errors: z.array(
      z.object({
        id: z.string(),
        error: z.string(),
      }),
    ),
  }),
);

export type BulkActionResponse = z.infer<typeof BulkActionResponseSchema>;

export const ExportInputSchema = z.object({
  format: z.enum(["csv", "json", "xlsx", "pdf"]),
  filters: z.array(FilterSchema).optional(),
  fields: z.array(z.string()).optional(),
});

export type ExportInput = z.infer<typeof ExportInputSchema>;

export const ExportResponseSchema = ResponseSchema(
  z.object({
    downloadUrl: z.string(),
    filename: z.string(),
    expiresAt: z.date(),
    recordCount: z.number(),
  }),
);

export type ExportResponse = z.infer<typeof ExportResponseSchema>;

export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string(),
  value: z.any().optional(),
});

export type ValidationError = z.infer<typeof ValidationErrorSchema>;

export const ValidationErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.literal("VALIDATION_ERROR"),
    message: z.string(),
    errors: z.array(ValidationErrorSchema),
  }),
});

export type ValidationErrorResponse = z.infer<
  typeof ValidationErrorResponseSchema
>;

export const APIErrorSchema = z.object({
  code: z.enum([
    "VALIDATION_ERROR",
    "NOT_FOUND",
    "UNAUTHORIZED",
    "FORBIDDEN",
    "CONFLICT",
    "INTERNAL_ERROR",
    "SERVICE_UNAVAILABLE",
    "RATE_LIMIT_EXCEEDED",
  ]),
  message: z.string(),
  details: z.record(z.any()).optional(),
  stack: z.string().optional(),
});

export type APIError = z.infer<typeof APIErrorSchema>;

export const StandardErrorResponseSchema = z.object({
  success: z.literal(false),
  error: APIErrorSchema,
});

export type StandardErrorResponse = z.infer<typeof StandardErrorResponseSchema>;

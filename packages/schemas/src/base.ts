import { z } from "zod";

export const IDSchema = z.string().cuid();
export type ID = z.infer<typeof IDSchema>;

export const TimestampSchema = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Timestamp = z.infer<typeof TimestampSchema>;

export const EmailSchema = z.string().email("Invalid email address");
export type Email = z.infer<typeof EmailSchema>;

export const PhoneSchema = z
  .string()
  .regex(/^\+?[\d\s-()]+$/, "Invalid phone number");
export type Phone = z.infer<typeof PhoneSchema>;

export const URLSchema = z.string().url("Invalid URL");
export type URL = z.infer<typeof URLSchema>;

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
export type Pagination = z.infer<typeof PaginationSchema>;

export const ResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  });
export type Response<T> = z.infer<ReturnType<typeof ResponseSchema<T>>>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
) =>
  ResponseSchema(
    z.object({
      items: z.array(dataSchema),
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrevious: z.boolean(),
    }),
  );
export type PaginatedResponse<T> = z.infer<
  ReturnType<typeof PaginatedResponseSchema<T>>
>;

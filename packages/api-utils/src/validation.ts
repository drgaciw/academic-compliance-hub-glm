/**
 * Validation utilities using Zod
 */

import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export const idSchema = z.string().cuid();

export const emailSchema = z.string().email();

export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type DateRange = z.infer<typeof dateRangeSchema>;

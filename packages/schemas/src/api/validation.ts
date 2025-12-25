import { z } from "zod";

export const TransferCreditSubmitInputSchema = z.object({
  institutionId: z.string().min(1, "Institution ID is required"),
  startDate: z.string().datetime("Invalid start date format"),
  endDate: z.string().datetime("Invalid end date format"),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
  documents: z.array(z.instanceof(File)).optional(),
});

export type TransferCreditSubmitInput = z.infer<
  typeof TransferCreditSubmitInputSchema
>;

export const SearchAIInputSchema = z.object({
  query: z
    .string()
    .min(1, "Query is required")
    .max(500, "Query must be less than 500 characters"),
  searchResults: z.array(z.any()).min(1, "Search results are required"),
  context: z.record(z.any()).optional(),
});

export type SearchAIInput = z.infer<typeof SearchAIInputSchema>;

export const CSPReportSchema = z.object({
  "csp-report": z.object({
    "document-uri": z.string().url().optional(),
    referrer: z.string().url().optional(),
    "violated-directive": z.string(),
    "effective-directive": z.string(),
    "original-policy": z.string(),
    disposition: z.string().optional(),
    "blocked-uri": z.string().optional(),
    "line-number": z.number().optional(),
    "column-number": z.number().optional(),
    "source-file": z.string().optional(),
    "status-code": z.number().optional(),
    "script-sample": z.string().optional(),
  }),
});

export type CSPReport = z.infer<typeof CSPReportSchema>;

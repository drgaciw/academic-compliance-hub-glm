import { z } from "zod";

export const SportSchema = z.enum([
  "FOOTBALL",
  "BASKETBALL",
  "BASEBALL",
  "SOCCER",
  "TENNIS",
  "SWIMMING",
  "TRACK",
  "CROSS_COUNTRY",
  "VOLLEYBALL",
  "SOFTBALL",
  "GOLF",
  "LACROSSE",
  "HOCKEY",
  "WRESTLING",
  "GYMNASTICS",
]);
export type Sport = z.infer<typeof SportSchema>;

export const EligibilityStatusSchema = z.enum([
  "ELIGIBLE",
  "INELIGIBLE",
  "PENDING",
  "UNDER_REVIEW",
  "CONDITIONAL",
]);
export type EligibilityStatus = z.infer<typeof EligibilityStatusSchema>;

export const StudentProfileSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  studentId: z.string(),
  sport: SportSchema,
  year: z.number().min(1).max(6),
  gpa: z.number().min(0).max(4).optional(),
  credits: z.number().default(0),
  eligibility: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type StudentProfile = z.infer<typeof StudentProfileSchema>;

export const CreateStudentProfileSchema = StudentProfileSchema.partial({
  id: true,
  eligibility: true,
  credits: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateStudentProfile = z.infer<typeof CreateStudentProfileSchema>;

export const UpdateStudentProfileSchema = CreateStudentProfileSchema.partial();
export type UpdateStudentProfile = z.infer<typeof UpdateStudentProfileSchema>;

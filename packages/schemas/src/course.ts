import { z } from "zod";

export const GradeSchema = z.enum([
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "D-",
  "F",
  "I",
  "W",
  "P",
  "NP",
]);
export type Grade = z.infer<typeof GradeSchema>;

export const CourseStatusSchema = z.enum([
  "IN_PROGRESS",
  "COMPLETED",
  "DROPPED",
  "WITHDRAWN",
]);
export type CourseStatus = z.infer<typeof CourseStatusSchema>;

export const CourseSchema = z.object({
  id: z.string().cuid(),
  code: z.string(),
  name: z.string(),
  credits: z.number().min(0),
  department: z.string(),
  semester: z.string(),
  year: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Course = z.infer<typeof CourseSchema>;

export const CreateCourseSchema = CourseSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateCourse = z.infer<typeof CreateCourseSchema>;

export const CourseEnrollmentSchema = z.object({
  id: z.string().cuid(),
  studentId: z.string().cuid(),
  courseId: z.string().cuid(),
  grade: GradeSchema.optional(),
  status: CourseStatusSchema.default("IN_PROGRESS"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type CourseEnrollment = z.infer<typeof CourseEnrollmentSchema>;

export const CreateCourseEnrollmentSchema = CourseEnrollmentSchema.partial({
  id: true,
  grade: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateCourseEnrollment = z.infer<
  typeof CreateCourseEnrollmentSchema
>;

import { z } from "zod";

export const RoleSchema = z.enum([
  "STUDENT",
  "ADVISOR",
  "ADMIN",
  "COMPLIANCE_OFFICER",
]);
export type Role = z.infer<typeof RoleSchema>;

export const UserSchema = z.object({
  id: z.string().cuid(),
  clerkId: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: RoleSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = CreateUserSchema.partial();
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

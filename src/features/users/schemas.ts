import { z } from "zod";

import { newPasswordSchema } from "@/features/auth/schemas";
import { USER_STATUSES } from "@/lib/auth/access";
import { imageUrlSchema, optionalPhoneSchema, requiredText } from "@/lib/validation";

export const USER_STATUS_LABELS: Record<(typeof USER_STATUSES)[number], string> = {
  active: "Active",
  blocked: "Blocked",
};

/** A user as listed/viewed (from users_view; never includes the password hash). */
export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  status: z.enum(USER_STATUSES),
  roleId: z.string().nullable(),
  roleName: z.string().nullable(),
  rolePermissions: z.array(z.string()).default([]),
  lastLoginAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type User = z.infer<typeof userSchema>;

export const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  permissions: z.array(z.string()),
});
export type Role = z.infer<typeof roleSchema>;

const baseFields = {
  firstName: requiredText(100),
  lastName: requiredText(100),
  phone: optionalPhoneSchema,
  avatarUrl: imageUrlSchema,
  roleId: z.string().min(1, "Choose a role"),
  status: z.enum(USER_STATUSES),
};

/** Create: the admin sets the first password (the user can change it after signing in). */
export const createUserSchema = z
  .object({
    ...baseFields,
    email: z.email("Enter a valid email address"),
    password: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });
export type CreateUserValues = z.infer<typeof createUserSchema>;

/** Edit: email is fixed; an empty password leaves it unchanged. */
export const editUserSchema = z
  .object({
    ...baseFields,
    password: z.union([z.literal(""), newPasswordSchema]),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });
export type EditUserValues = z.infer<typeof editUserSchema>;

export const updateUserSchema = editUserSchema.and(z.object({ id: z.string().min(1) }));

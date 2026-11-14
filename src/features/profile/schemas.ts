import { z } from "zod";

import { imageUrlSchema, optionalPhoneSchema, requiredText } from "@/lib/validation";

/** What people may change about themselves. Email, role and status are not here on purpose. */
export const profileSchema = z.object({
  firstName: requiredText(100),
  lastName: requiredText(100),
  phone: optionalPhoneSchema,
  avatarUrl: imageUrlSchema,
});
export type ProfileValues = z.infer<typeof profileSchema>;

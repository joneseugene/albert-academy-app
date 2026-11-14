import { z } from "zod";

import { richText } from "@/lib/rich-text";
import { imageUrlSchema, optionalText, optionalYearSchema, requiredText } from "@/lib/validation";

export const CONTACT_TYPES = {
  phone: "Phone",
  email: "Email",
  address: "Address",
  website: "Website",
  po_box: "P.O. Box",
  other: "Other",
} as const;
export type ContactType = keyof typeof CONTACT_TYPES;
const CONTACT_KEYS = Object.keys(CONTACT_TYPES) as [ContactType, ...ContactType[]];

export const SOCIAL_PLATFORMS = {
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X (Twitter)",
  youtube: "YouTube",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  other: "Other",
} as const;
export type SocialPlatform = keyof typeof SOCIAL_PLATFORMS;
const SOCIAL_KEYS = Object.keys(SOCIAL_PLATFORMS) as [SocialPlatform, ...SocialPlatform[]];

const contactSchema = z
  .object({
    type: z.enum(CONTACT_KEYS),
    /** e.g. "Principal's office", "Admissions". */
    label: optionalText(80),
    value: requiredText(300),
  })
  .superRefine((c, ctx) => {
    if (c.type === "email" && !z.email().safeParse(c.value).success) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "Enter a valid email" });
    }
  });

const socialSchema = z.object({
  platform: z.enum(SOCIAL_KEYS),
  /** Profile URL or handle, e.g. https://facebook.com/albertacademy or @albertacademy. */
  handle: requiredText(300),
});

/** Stored record (single row). */
export const schoolInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  motto: z.string().nullable(),
  foundedYear: z.number().nullable(),
  logoUrl: z.string().nullable(),
  vision: z.string().nullable(),
  mission: z.string().nullable(),
  about: z.string().nullable(),
  history: z.string().nullable(),
  /** Photo of the school shown with the About text (null until the migration has run). */
  aboutPhotoUrl: z.string().nullable().default(null),
  coreValues: z.array(z.string()).default([]),
  contacts: z
    .array(
      z.object({ type: z.string(), label: z.string().nullable().optional(), value: z.string() }),
    )
    .default([]),
  socialLinks: z.array(z.object({ platform: z.string(), handle: z.string() })).default([]),
  /** The person the school is named after. */
  namesakeName: z.string().nullable(),
  namesakePhotoUrl: z.string().nullable(),
  namesakeBirth: z.string().nullable(),
  namesakeDeath: z.string().nullable(),
  namesakeAbout: z.string().nullable(),
  updatedAt: z.coerce.date(),
});
export type SchoolInfo = z.infer<typeof schoolInfoSchema>;

export const schoolInfoFormSchema = z.object({
  name: requiredText(200),
  motto: optionalText(200),
  foundedYear: optionalYearSchema,
  logoUrl: imageUrlSchema,
  vision: richText(5000),
  mission: richText(5000),
  about: richText(20_000),
  history: richText(50_000),
  aboutPhotoUrl: imageUrlSchema,
  coreValues: z.array(z.object({ value: requiredText(120) })).max(30),
  contacts: z.array(contactSchema).max(50),
  socialLinks: z.array(socialSchema).max(30),
  namesakeName: optionalText(200),
  namesakePhotoUrl: imageUrlSchema,
  /** Free text: "1850", "12 March 1850, Dayton, Ohio". */
  namesakeBirth: optionalText(150),
  namesakeDeath: optionalText(150),
  namesakeAbout: richText(20_000),
});
export type SchoolInfoFormValues = z.input<typeof schoolInfoFormSchema>;
export type SchoolInfoFormOutput = z.output<typeof schoolInfoFormSchema>;

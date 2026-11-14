import { z } from "zod";

import { optionalPhoneSchema, requiredText } from "@/lib/validation";

export const ENQUIRY_TOPICS = {
  admissions: "Admissions",
  general: "General enquiry",
  alumni: "Alumni",
  media: "Media & partnerships",
  other: "Other",
} as const;
export type EnquiryTopic = keyof typeof ENQUIRY_TOPICS;
const TOPIC_KEYS = Object.keys(ENQUIRY_TOPICS) as [EnquiryTopic, ...EnquiryTopic[]];
export const topicLabel = (t: string) => ENQUIRY_TOPICS[t as EnquiryTopic] ?? t;

export const ENQUIRY_STATUSES = { new: "New", read: "Read", replied: "Replied" } as const;
export type EnquiryStatus = keyof typeof ENQUIRY_STATUSES;
const STATUS_KEYS = Object.keys(ENQUIRY_STATUSES) as [EnquiryStatus, ...EnquiryStatus[]];

export const enquirySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  topic: z.string(),
  message: z.string(),
  status: z.enum(STATUS_KEYS),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Enquiry = z.infer<typeof enquirySchema>;

export const ENQUIRY_MESSAGE_MAX = 2000;

/** The public contact form. `website` is a hidden trap field that people never fill. */
export const enquiryFormSchema = z.object({
  name: requiredText(120),
  email: z.email("Enter a valid email address"),
  phone: optionalPhoneSchema,
  topic: z.enum(TOPIC_KEYS, { error: "Choose a topic" }),
  message: z
    .string()
    .trim()
    .min(10, "Please write a little more")
    .max(ENQUIRY_MESSAGE_MAX, `At most ${ENQUIRY_MESSAGE_MAX} characters`),
  website: z.string().max(500).optional(),
});
export type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;

export const enquiryStatusInput = z.object({ id: z.string().min(1), status: z.enum(STATUS_KEYS) });

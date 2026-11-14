import {
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  MessageCircleIcon,
  PhoneIcon,
  type LucideIcon,
} from "lucide-react";

/** Shared by the footer and the home page's contact section. */
export const CONTACT_ICONS: Record<string, LucideIcon> = {
  phone: PhoneIcon,
  email: MailIcon,
  address: MapPinIcon,
  website: GlobeIcon,
  po_box: MailIcon,
  other: MessageCircleIcon,
};

/** Handles like "@albertacademy" become links on the platform where possible. */
export function socialHref(platform: string, handle: string) {
  if (/^https?:\/\//.test(handle)) return handle;
  const h = handle.replace(/^@/, "");
  const base: Record<string, string> = {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    x: "https://x.com/",
    youtube: "https://youtube.com/@",
    tiktok: "https://tiktok.com/@",
    linkedin: "https://linkedin.com/company/",
  };
  return base[platform] ? base[platform] + h : null;
}

export function contactHref(type: string, value: string) {
  if (type === "phone") return `tel:${value.replace(/[^\d+]/g, "")}`;
  if (type === "email") return `mailto:${value}`;
  if (type === "website") return /^https?:/.test(value) ? value : `https://${value}`;
  return null;
}

import "server-only";

import type { EmailMessage } from "@/server/ports/mailer";
import { topicLabel, type Enquiry } from "../schemas";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Tells the school's office that a new enquiry arrived (reply goes straight to the sender). */
export function newEnquiryEmail(to: string, e: Enquiry, adminUrl: string | null): EmailMessage {
  const subject = `New enquiry from ${e.name}: ${topicLabel(e.topic)}`;
  const lines = [
    `${e.name} <${e.email}>${e.phone ? ` · ${e.phone}` : ""}`,
    `Topic: ${topicLabel(e.topic)}`,
    "",
    e.message,
    "",
    adminUrl ? `Open in the admin: ${adminUrl}` : "Open Enquiries in the admin to manage it.",
  ];
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f5f4f4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c1c1c">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e7e5e5;border-radius:12px">
    <tr><td style="padding:18px 24px;border-bottom:1px solid #e7e5e5;font-weight:600;color:#8F1A26">New enquiry · ${escape(topicLabel(e.topic))}</td></tr>
    <tr><td style="padding:24px">
      <p style="margin:0 0 4px;font-weight:600">${escape(e.name)}</p>
      <p style="margin:0 0 16px;font-size:13px;color:#555"><a href="mailto:${escape(e.email)}" style="color:#8F1A26">${escape(e.email)}</a>${e.phone ? ` · ${escape(e.phone)}` : ""}</p>
      <p style="margin:0;font-size:15px;line-height:1.6;white-space:pre-wrap">${escape(e.message)}</p>
    </td></tr>
  </table>
  <p style="max-width:560px;margin:12px auto 0;font-size:11px;color:#999;text-align:center">Reply to this email to answer ${escape(e.name)} directly.</p>
</body></html>`;
  return { to, subject, text: lines.join("\n"), html };
}

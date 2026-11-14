import "server-only";

import type { EmailMessage } from "@/server/ports/mailer";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The password-reset email: short, branded, readable without images. */
export function resetCodeEmail({
  to,
  firstName,
  code,
  minutes,
}: {
  to: string;
  firstName: string;
  code: string;
  minutes: number;
}): EmailMessage {
  const subject = `${code} is your Albert Academy reset code`;
  const text = [
    `Hi ${firstName},`,
    "",
    `Your code to reset your Albert Academy password is: ${code}`,
    "",
    `It expires in ${minutes} minutes and works once.`,
    "If you didn't ask for this, ignore this email. Your password stays the same.",
    "",
    "Albert Academy Secondary School",
  ].join("\n");

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f5f4f4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c1c1c">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e5;border-radius:16px">
    <tr><td style="padding:20px 28px;border-bottom:1px solid #e7e5e5">
      <span style="font-weight:600;font-size:15px;color:#8F1A26">Albert Academy</span>
      <span style="font-size:12px;color:#777;font-style:italic">&nbsp;· Esse quam videri</span>
    </td></tr>
    <tr><td style="padding:28px">
      <p style="margin:0 0 12px;font-size:15px">Hi ${escape(firstName)},</p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.5">Use this code to reset your password:</p>
      <p style="margin:0 0 20px;font-size:32px;font-weight:700;letter-spacing:8px;font-family:ui-monospace,Menlo,Consolas,monospace;color:#8F1A26">${code}</p>
      <p style="margin:0 0 8px;font-size:13px;color:#555">It expires in ${minutes} minutes and works once.</p>
      <p style="margin:0;font-size:13px;color:#555">If you didn't ask for this, ignore this email. Your password stays the same.</p>
    </td></tr>
  </table>
  <p style="max-width:480px;margin:12px auto 0;font-size:11px;color:#999;text-align:center">Albert Academy Secondary School, Freetown, Sierra Leone</p>
</body></html>`;

  return { to, subject, text, html };
}

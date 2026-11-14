import "server-only";
import nodemailer from "nodemailer";

import { AppError } from "@/server/core/errors";
import { logger } from "@/server/core/logger";
import { serverEnv } from "@/server/env";
import type { Mailer } from "@/server/ports/mailer";

/*
 * Picks how email is sent, from the environment (.env.local):
 *   SMTP_HOST (+ SMTP_PORT, SMTP_USER, SMTP_PASSWORD)  -> any SMTP server
 *                                                        (Gmail app password, Zoho, cPanel…)
 *   RESEND_API_KEY                                     -> Resend (resend.com)
 *   neither, in development                            -> printed to the server console
 *   neither, in production                             -> sending fails with a clear message
 * EMAIL_FROM sets the sender, e.g. "Albert Academy <no-reply@albertacademy.edu.sl>".
 */

const from = () =>
  serverEnv.EMAIL_FROM ?? serverEnv.SMTP_USER ?? "Albert Academy <no-reply@localhost>";

function smtpMailer(): Mailer {
  const port = serverEnv.SMTP_PORT ?? 587;
  const transport = nodemailer.createTransport({
    host: serverEnv.SMTP_HOST,
    port,
    secure: port === 465, // 465 = TLS from the start; 587 upgrades with STARTTLS
    auth: serverEnv.SMTP_USER
      ? { user: serverEnv.SMTP_USER, pass: serverEnv.SMTP_PASSWORD }
      : undefined,
  });
  return {
    name: "smtp",
    configured: true,
    async send(m) {
      await transport.sendMail({
        from: from(),
        to: m.to,
        subject: m.subject,
        text: m.text,
        html: m.html,
      });
    },
  };
}

function resendMailer(apiKey: string): Mailer {
  return {
    name: "resend",
    configured: true,
    async send(m) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: from(),
          to: [m.to],
          subject: m.subject,
          text: m.text,
          html: m.html,
        }),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
    },
  };
}

/** Development only: shows the email in the terminal running `pnpm dev`. */
const consoleMailer: Mailer = {
  name: "console",
  configured: false,
  async send(m) {
    console.log(
      `\n──── Email (not sent: no SMTP_HOST / RESEND_API_KEY) ────\nTo: ${m.to}\nSubject: ${m.subject}\n\n${m.text}\n────────────────────────────────────────\n`,
    );
  },
};

const unconfigured: Mailer = {
  name: "none",
  configured: false,
  async send() {
    logger.error("Email is not configured: set SMTP_HOST or RESEND_API_KEY");
    throw AppError.internal("Email isn't set up yet");
  },
};

let mailer: Mailer | undefined;

export function getMailer(): Mailer {
  mailer ??= serverEnv.SMTP_HOST
    ? smtpMailer()
    : serverEnv.RESEND_API_KEY
      ? resendMailer(serverEnv.RESEND_API_KEY)
      : serverEnv.NODE_ENV === "production"
        ? unconfigured
        : consoleMailer;
  return mailer;
}

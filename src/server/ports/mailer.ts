/** Outgoing email. One implementation is chosen from the environment (see adapters/mail). */
export type EmailMessage = {
  to: string;
  subject: string;
  /** Plain-text body (always sent; some clients show only this). */
  text: string;
  html: string;
};

export interface Mailer {
  /** e.g. "smtp", "resend", "console" — for logs. */
  readonly name: string;
  /** False when nothing really sends (development console fallback, or unset in production). */
  readonly configured: boolean;
  send(message: EmailMessage): Promise<void>;
}

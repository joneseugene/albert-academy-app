import { topicLabel, type Enquiry } from "../schemas";

/** Opens the staff member's email app with a reply already addressed and quoted. */
export function replyHref(e: Pick<Enquiry, "email" | "name" | "topic" | "message">) {
  const subject = `Re: your ${topicLabel(e.topic).toLowerCase()} at Albert Academy`;
  const quoted = e.message
    .split("\n")
    .map((l) => `> ${l}`)
    .join("\n");
  const body = `Dear ${e.name},\n\n\n\n${quoted}`;
  return `mailto:${e.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

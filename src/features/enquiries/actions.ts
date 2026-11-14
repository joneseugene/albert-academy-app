"use server";

import { headers } from "next/headers";
import { after } from "next/server";

import { routes } from "@/config/routes";
import { getSchool } from "@/features/site/server/queries";
import { idSchema } from "@/lib/validation";
import { backend } from "@/server/backend";
import { defineAction } from "@/server/core/action";
import { logger } from "@/server/core/logger";
import { enforceRateLimit } from "@/server/core/rate-limit";
import { enquiryFormSchema, enquiryStatusInput } from "./schemas";
import { enquiriesService } from "./server/service";
import { newEnquiryEmail } from "./server/notify";

/** Contact form on the website. */
export const submitEnquiryAction = defineAction({
  public: true,
  input: enquiryFormSchema,
  handler: async (values) => {
    // Bots fill the hidden "website" field; pretend it worked and drop it.
    if (values.website) return { received: true };
    await enforceRateLimit("enquiry");
    const enquiry = await enquiriesService.submit(values);

    // Let the office know (after responding), when email is set up.
    if (backend.mailer.configured) {
      const h = await headers();
      const host = h.get("x-forwarded-host") ?? h.get("host");
      const proto = h.get("x-forwarded-proto") ?? "https";
      const adminUrl = host ? `${proto}://${host}${routes.enquiries}/${enquiry.id}` : null;
      after(async () => {
        try {
          const school = await getSchool();
          const to = school?.contacts.find((c) => c.type === "email")?.value;
          if (!to) return;
          await backend.mailer.send({ ...newEnquiryEmail(to, enquiry, adminUrl) });
        } catch (error) {
          logger.error("Enquiry notification failed", {
            message: error instanceof Error ? error.message : String(error),
          });
        }
      });
    }
    return { received: true };
  },
});

export const setEnquiryStatusAction = defineAction({
  input: enquiryStatusInput,
  handler: ({ id, status }) => enquiriesService.setStatus(id, status),
  refresh: true,
});

export const deleteEnquiryAction = defineAction({
  input: idSchema,
  handler: ({ id }) => enquiriesService.remove(id),
  refresh: true,
});

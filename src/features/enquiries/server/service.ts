import "server-only";

import { emptyToNull } from "@/lib/validation";
import { backend } from "@/server/backend";
import { createCrudService } from "@/server/core/service";
import { defineResource } from "@/server/core/resource";
import {
  enquirySchema,
  type Enquiry,
  type EnquiryFormValues,
  type EnquiryStatus,
} from "../schemas";

type EnquiryWrite = Omit<Enquiry, "id" | "createdAt" | "updatedAt">;

export const enquiriesResource = defineResource<Enquiry, EnquiryWrite, Partial<EnquiryWrite>>({
  name: "enquiries",
  entity: enquirySchema,
  searchable: ["name", "email", "message"],
  sortable: ["name", "topic", "status", "createdAt"],
  filterable: ["status", "topic"],
  defaultSort: [{ field: "createdAt", direction: "desc" }],
  softDelete: true,
});

// Staff side: read, mark and delete. Nobody "creates" enquiries in the admin.
const crud = createCrudService(enquiriesResource, {
  read: "enquiries.read",
  update: "enquiries.update",
  delete: "enquiries.delete",
});

export const enquiriesService = {
  list: crud.list,
  get: crud.get,
  remove: crud.remove,
  setStatus: (id: string, status: EnquiryStatus) => crud.update(id, { status }),

  /** From the public website — no sign-in. The action rate-limits it. */
  submit(v: EnquiryFormValues) {
    return backend.repository(enquiriesResource).create({
      name: v.name,
      email: v.email.trim().toLowerCase(),
      phone: emptyToNull(v.phone),
      topic: v.topic,
      message: v.message,
      status: "new",
    });
  },
};

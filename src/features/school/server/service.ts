import "server-only";
import { updateTag } from "next/cache";

import { PUBLIC_CACHE_TAG } from "@/lib/cache-tags";
import { emptyToNull } from "@/lib/validation";
import { assertPermission } from "@/server/auth/session";
import { backend } from "@/server/backend";
import { AppError } from "@/server/core/errors";
import { defineResource } from "@/server/core/resource";
import { schoolInfoSchema, type SchoolInfo, type SchoolInfoFormOutput } from "../schemas";

type SchoolInfoWrite = Omit<SchoolInfo, "id" | "updatedAt">;

/** Single-row table (id = 1), created by the migration. */
const SCHOOL_ID = "1";

export const schoolResource = defineResource<SchoolInfo, never, SchoolInfoWrite>({
  name: "school_info",
  entity: schoolInfoSchema,
});

const repo = () => backend.repository(schoolResource);

export const schoolService = {
  async get(): Promise<SchoolInfo> {
    await assertPermission("school.read");
    const info = await repo().getById(SCHOOL_ID);
    if (!info) throw AppError.internal("school_info row is missing. Run the migrations");
    return info;
  },

  async update(v: SchoolInfoFormOutput) {
    await assertPermission("school.update");
    const saved = await repo().update(SCHOOL_ID, {
      name: v.name,
      motto: emptyToNull(v.motto),
      foundedYear: v.foundedYear ?? null,
      logoUrl: emptyToNull(v.logoUrl),
      vision: emptyToNull(v.vision),
      mission: emptyToNull(v.mission),
      about: emptyToNull(v.about),
      history: emptyToNull(v.history),
      aboutPhotoUrl: emptyToNull(v.aboutPhotoUrl),
      coreValues: v.coreValues.map((c) => c.value),
      contacts: v.contacts.map((c) => ({
        type: c.type,
        label: emptyToNull(c.label),
        value: c.value,
      })),
      socialLinks: v.socialLinks,
      namesakeName: emptyToNull(v.namesakeName),
      namesakePhotoUrl: emptyToNull(v.namesakePhotoUrl),
      namesakeBirth: emptyToNull(v.namesakeBirth),
      namesakeDeath: emptyToNull(v.namesakeDeath),
      namesakeAbout: emptyToNull(v.namesakeAbout),
    });
    updateTag(PUBLIC_CACHE_TAG); // the website shows this right away
    return saved;
  },
};

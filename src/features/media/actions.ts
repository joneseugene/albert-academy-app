"use server";

import { z } from "zod";

import type { Permission } from "@/config/permissions";
import { IMAGE_FOLDERS, type ImageFolder } from "@/lib/images";
import { assertAnyPermission } from "@/server/auth/session";
import { defineAction } from "@/server/core/action";
import { AppError } from "@/server/core/errors";
import { storeImage } from "@/server/core/images";

/** Who may upload into each folder: anyone who can create or edit that module. */
const FOLDER_PERMISSIONS: Record<ImageFolder, Permission[]> = {
  school: ["school.update"],
  leadership: ["leadership.create", "leadership.update"],
  administration: ["administration.create", "administration.update"],
  alumni: ["alumni.create", "alumni.update"],
  news: ["news.create", "news.update"],
  activities: ["activities.create", "activities.update"],
  gallery: ["gallery.create", "gallery.update"],
  resources: ["resources.create", "resources.update"],
  livestreams: ["livestreams.create", "livestreams.update"],
  notices: ["notices.create", "notices.update"],
  users: ["users.create", "users.update"],
  avatars: [], // any signed-in user (checked by defineAction)
};

/**
 * Upload one image (FormData: `file`, `folder`) and return its public URL.
 * The URL is saved with the record when its form is submitted.
 */
export const uploadImageAction = defineAction({
  input: z.instanceof(FormData),
  handler: async (form) => {
    const folder = String(form.get("folder") ?? "");
    if (!(folder in IMAGE_FOLDERS)) throw AppError.validation("Unknown upload folder");
    const required = FOLDER_PERMISSIONS[folder as ImageFolder];
    if (required.length) await assertAnyPermission(...required);
    return { url: await storeImage(form, IMAGE_FOLDERS[folder as ImageFolder]) };
  },
});

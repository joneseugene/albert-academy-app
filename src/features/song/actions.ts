"use server";

import { defineAction } from "@/server/core/action";
import { audioUploadSchema, songFormSchema } from "./schemas";
import { songService } from "./server/service";

export const updateSongAction = defineAction({
  input: songFormSchema,
  handler: (values) => songService.update(values),
  refresh: true,
});

/** Step 1 of an upload: get a one-time URL; the browser then PUTs the file to it. */
export const createSongUploadAction = defineAction({
  input: audioUploadSchema,
  handler: ({ contentType }) => songService.createUpload(contentType),
});

import "server-only";
import { randomUUID } from "node:crypto";

import { MAX_IMAGE_BYTES } from "@/lib/images";
import { backend } from "@/server/backend";
import { AppError } from "./errors";

const SIGNATURES: Array<{ type: string; ext: string; test: (b: Uint8Array) => boolean }> = [
  {
    type: "image/png",
    ext: "png",
    test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  { type: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    type: "image/webp",
    ext: "webp",
    test: (b) =>
      String.fromCharCode(...b.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...b.slice(8, 12)) === "WEBP",
  },
];

/**
 * Validate an uploaded image by its actual bytes (not the file name or the
 * browser's claimed type): PNG, JPEG or WebP, within the size limit. SVG is
 * refused — it can carry scripts. Stores it under `folder`; returns its URL.
 */
export async function storeImage(form: FormData, folder: string): Promise<string> {
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw AppError.validation("Choose an image to upload", { file: ["Choose an image"] });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw AppError.validation("That image is too large", {
      file: [`Use an image under ${MAX_IMAGE_BYTES / 1024 / 1024} MB`],
    });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const match = SIGNATURES.find((s) => s.test(bytes));
  if (!match) {
    throw AppError.validation("Unsupported image", { file: ["Use a PNG, JPEG or WebP image"] });
  }
  return backend.files.upload(`${folder}/${randomUUID()}.${match.ext}`, bytes, match.type);
}

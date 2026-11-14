/** Shared (client + server) limits for uploaded images. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp";

/**
 * Storage folders, one per module. Uploading into a folder needs permission
 * to create or edit that module's records (see features/media).
 */
export const IMAGE_FOLDERS = {
  school: "school",
  leadership: "leadership",
  administration: "administration",
  alumni: "alumni",
  news: "news",
  activities: "activities",
  gallery: "gallery",
  resources: "resources",
  livestreams: "livestreams",
  notices: "notices",
  users: "users",
  /** Your own profile photo (any signed-in user). */
  avatars: "avatars",
} as const;

export type ImageFolder = keyof typeof IMAGE_FOLDERS;

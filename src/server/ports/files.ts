/** Public file storage for non-sensitive media (photos, logos, the school song). */
export interface FileStore {
  /**
   * Store a public image under `key` (e.g. "news/<random>.png") and return its
   * public URL. Keys are never reused, so URLs can be cached forever.
   */
  upload(key: string, bytes: Uint8Array, contentType: string): Promise<string>;
  /** Best-effort delete of a file previously returned by `upload`. Unknown URLs are ignored. */
  remove(url: string): Promise<void>;
  /**
   * A one-time URL the browser can PUT a large audio file to directly
   * (bypassing the app server), plus the public URL it will have.
   */
  createAudioUpload(key: string): Promise<{ uploadUrl: string; publicUrl: string }>;
}

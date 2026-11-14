/**
 * Cache tag for everything the public website shows. Public queries tag
 * their cached results with it; every admin save calls updateTag() with it,
 * so the website reflects changes on the next request.
 */
export const PUBLIC_CACHE_TAG = "public-content";

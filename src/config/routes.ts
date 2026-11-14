/** Central route map so redirects and links never drift apart. */
export const routes = {
  /** Admin console home (dashboard). */
  home: "/admin",

  // School
  school: "/admin/school",
  song: "/admin/song",
  leadership: "/admin/leadership",
  administration: "/admin/administration",
  alumni: "/admin/alumni",

  // Content
  news: "/admin/news",
  activities: "/admin/activities",
  gallery: "/admin/gallery",
  resources: "/admin/resources",
  facts: "/admin/facts",
  livestreams: "/admin/livestreams",
  enquiries: "/admin/enquiries",
  notices: "/admin/notices",

  // System
  users: "/admin/users",

  // Everyone signed in
  profile: "/admin/profile",
  changePassword: "/admin/profile/password",
  forbidden: "/admin/forbidden",

  // Public
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
} as const;

/** The public website. */
export const site = {
  home: "/",
  about: "/about",
  news: "/news",
  activities: "/activities",
  gallery: "/gallery",
  alumni: "/alumni",
  resources: "/resources",
  song: "/song",
  live: "/live",
  notices: "/notices",
} as const;

/** Only these need a session (checked optimistically in src/proxy.ts). */
export const PROTECTED_PREFIX = "/admin";

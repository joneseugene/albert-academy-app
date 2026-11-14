/**
 * Permission catalog — the single source of truth for what can be granted.
 * Roles hold lists of these strings; code checks permissions, never role names.
 *
 * Naming: `<resource>.<action>`. The wildcard `*` grants everything (Super Admin).
 */
const crud = (label: string, plural: string) => ({
  label,
  permissions: {
    read: `View ${plural}`,
    create: `Add ${plural}`,
    update: `Edit ${plural}`,
    delete: `Delete ${plural}`,
  },
});

export const PERMISSION_GROUPS = {
  users: crud("Users", "users"),
  alumni: crud("Notable alumni", "notable alumni"),
  leadership: crud("Leadership", "principals and past leaders"),
  administration: crud("School administration", "administration staff"),
  news: crud("News", "news articles"),
  resources: crud("Academic resources", "academic resources"),
  gallery: crud("Gallery", "gallery photos"),
  activities: crud("Activities", "activities"),
  facts: crud("Did you know?", "facts"),
  livestreams: crud("Live streams", "live streams"),
  notices: crud("Public notices", "public notices"),
  enquiries: {
    label: "Enquiries",
    permissions: {
      read: "Read enquiries from the website",
      update: "Mark enquiries as read / replied",
      delete: "Delete enquiries",
    },
  },
  school: {
    label: "School information",
    permissions: { read: "View school information", update: "Edit school information" },
  },
} as const;

type Groups = typeof PERMISSION_GROUPS;

export type PermissionModule = keyof Groups;

export type Permission = {
  [G in keyof Groups]: `${G & string}.${keyof Groups[G]["permissions"] & string}`;
}[keyof Groups];

export const SUPER_PERMISSION = "*" as const;

export const ALL_PERMISSIONS = Object.entries(PERMISSION_GROUPS).flatMap(([module, group]) =>
  Object.keys(group.permissions).map((action) => `${module}.${action}` as Permission),
);

export function isPermission(value: string): value is Permission {
  return (ALL_PERMISSIONS as string[]).includes(value);
}

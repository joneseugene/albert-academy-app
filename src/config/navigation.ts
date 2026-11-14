import {
  BookOpenIcon,
  BriefcaseIcon,
  CalendarRangeIcon,
  CrownIcon,
  ImagesIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LightbulbIcon,
  MegaphoneIcon,
  RadioIcon,
  MusicIcon,
  NewspaperIcon,
  SchoolIcon,
  StarIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { canAccess, type AccessRule, type CurrentUser } from "@/lib/auth/access";
import { routes } from "./routes";

export type NavItem = AccessRule & {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Shown under the page title. */
  description?: string;
};

export type NavGroup = AccessRule & {
  label: string;
  items: NavItem[];
};

/**
 * Single navigation config for every role. The sidebar shows an item when the
 * user holds all its `permissions`. Pages enforce the same rule server-side.
 */
export const navigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: routes.home, icon: LayoutDashboardIcon },
      {
        title: "Enquiries",
        href: routes.enquiries,
        icon: InboxIcon,
        permissions: ["enquiries.read"],
        description: "Messages sent from the website's contact form",
      },
    ],
  },
  {
    label: "School",
    items: [
      {
        title: "School Info",
        href: routes.school,
        icon: SchoolIcon,
        permissions: ["school.read"],
        description: "Vision, mission, about, contacts and social media",
      },
      {
        title: "School Song",
        href: routes.song,
        icon: MusicIcon,
        permissions: ["school.read"],
        description: "The recording and lyrics visitors can play",
      },
      {
        title: "Leadership",
        href: routes.leadership,
        icon: CrownIcon,
        permissions: ["leadership.read"],
        description: "Current and past principals",
      },
      {
        title: "Administration",
        href: routes.administration,
        icon: BriefcaseIcon,
        permissions: ["administration.read"],
        description: "The school's administration staff",
      },
      {
        title: "Notable Alumni",
        href: routes.alumni,
        icon: StarIcon,
        permissions: ["alumni.read"],
        description: "Old students the school is proud of",
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        title: "News",
        href: routes.news,
        icon: NewspaperIcon,
        permissions: ["news.read"],
        description: "News and announcements",
      },
      {
        title: "Public Notices",
        href: routes.notices,
        icon: MegaphoneIcon,
        permissions: ["notices.read"],
        description: "Announcements that can pop up when the website loads",
      },
      {
        title: "Activities",
        href: routes.activities,
        icon: CalendarRangeIcon,
        permissions: ["activities.read"],
        description: "Academic, sports, entertainment and other activities",
      },
      {
        title: "Gallery",
        href: routes.gallery,
        icon: ImagesIcon,
        permissions: ["gallery.read"],
        description: "Photos from school life",
      },
      {
        title: "Academic Resources",
        href: routes.resources,
        icon: BookOpenIcon,
        permissions: ["resources.read"],
        description: "Links to past papers, syllabuses and learning material",
      },
      {
        title: "Did You Know?",
        href: routes.facts,
        icon: LightbulbIcon,
        permissions: ["facts.read"],
        description: "Short facts about the school for the public",
      },
      {
        title: "Live Streams",
        href: routes.livestreams,
        icon: RadioIcon,
        permissions: ["livestreams.read"],
        description: "YouTube and Facebook live streams shown on the website",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Users",
        href: routes.users,
        icon: UsersIcon,
        permissions: ["users.read"],
        description: "Who can sign in to this console",
      },
    ],
  },
];

/** Navigation filtered to what this user may see (empty groups dropped). */
export function navigationFor(user: CurrentUser): NavGroup[] {
  return navigation
    .filter((group) => canAccess(user, group))
    .map((group) => ({ ...group, items: group.items.filter((item) => canAccess(user, item)) }))
    .filter((group) => group.items.length > 0);
}

/** Best nav match for a pathname (longest href prefix), for page titles. */
export function findNavItem(
  pathname: string,
  groups: NavGroup[] = navigation,
): (NavItem & { group: string }) | undefined {
  let best: (NavItem & { group: string }) | undefined;
  for (const group of groups) {
    for (const navItem of group.items) {
      const item = { ...navItem, group: group.label };
      const matches =
        item.href === routes.home
          ? pathname === routes.home
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (matches && (!best || item.href.length > best.href.length)) best = item;
    }
  }
  return best;
}

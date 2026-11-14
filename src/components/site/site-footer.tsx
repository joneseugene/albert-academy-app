import { cacheLife } from "next/cache";
import Link from "next/link";
import { MessageCircleIcon } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { routes, site } from "@/config/routes";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/features/school/schemas";
import type { PublicSchool } from "@/features/site/server/queries";
import { CONTACT_ICONS, contactHref, socialHref } from "./contact-links";
import { Container } from "./primitives";

/** Cached so the footer can be prerendered (the year changes once a year). */
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

const COLUMNS = [
  {
    title: "School",
    links: [
      { href: site.about, label: "About us" },
      { href: `${site.about}#leadership`, label: "Leadership" },
      { href: `${site.about}#administration`, label: "Administration" },
      { href: site.alumni, label: "Notable alumni" },
    ],
  },
  {
    title: "School life",
    links: [
      { href: site.news, label: "News" },
      { href: site.notices, label: "Public notices" },
      { href: site.activities, label: "Activities" },
      { href: site.gallery, label: "Gallery" },
      { href: site.song, label: "School song" },
    ],
  },
  {
    title: "Learning",
    links: [
      { href: site.resources, label: "Academic resources" },
      { href: `${site.about}#mission`, label: "Vision & mission" },
    ],
  },
];

export function SiteFooter({ school }: { school: PublicSchool }) {
  const contacts = school?.contacts ?? [];
  const socials = school?.socialLinks ?? [];

  return (
    <footer className="border-t bg-muted/40">
      <Container className="grid gap-12 py-14 lg:grid-cols-[1.3fr_2fr]">
        <div className="grid content-start gap-5">
          <div className="flex items-center gap-3">
            <LogoMark className="h-12" title="" />
            <div>
              <p className="font-semibold tracking-tight">{school?.name ?? "Albert Academy"}</p>
              {school?.motto && (
                <p className="text-sm text-muted-foreground italic">{school.motto}</p>
              )}
            </div>
          </div>
          {contacts.length > 0 && (
            <ul className="grid gap-2 text-sm text-muted-foreground">
              {contacts.map((c, i) => {
                const Icon = CONTACT_ICONS[c.type] ?? MessageCircleIcon;
                const href = contactHref(c.type, c.value);
                const text = c.label ? `${c.label}: ${c.value}` : c.value;
                return (
                  <li key={i} className="flex items-start gap-2">
                    <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {href ? (
                      <a href={href} className="hover:text-foreground">
                        {text}
                      </a>
                    ) : (
                      <span className="whitespace-pre-line">{text}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {socials.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {socials.map((s, i) => {
                const href = socialHref(s.platform, s.handle);
                const label =
                  SOCIAL_PLATFORMS[s.platform as SocialPlatform] ?? s.platform ?? "Social";
                return (
                  <li key={i}>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex rounded-full border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
                      >
                        {label}
                      </a>
                    ) : (
                      <span className="inline-flex rounded-full border bg-background px-3 py-1.5 text-xs">
                        {label}: {s.handle}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-sm font-semibold">{col.title}</p>
              <ul className="grid gap-2 text-sm text-muted-foreground">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
      <div className="border-t">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © <CurrentYear /> {school?.name ?? "Albert Academy"}. All rights reserved.
          </p>
          <Link href={routes.login} className="hover:text-foreground">
            Staff sign in
          </Link>
        </Container>
      </div>
    </footer>
  );
}

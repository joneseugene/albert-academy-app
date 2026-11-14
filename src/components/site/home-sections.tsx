import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon, UserIcon } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { site } from "@/config/routes";
import type { Administrator } from "@/features/administration/schemas";
import { lateLabel, type Alumnus } from "@/features/alumni/schemas";
import { EnquiryForm } from "@/features/enquiries/components/enquiry-form";
import type { Leader } from "@/features/leadership/schemas";
import { newsDate, type News } from "@/features/news/schemas";
import type { AcademicResource } from "@/features/resources/schemas";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/features/school/schemas";
import type { PublicSchool } from "@/features/site/server/queries";
import { excerpt, htmlToText } from "@/lib/rich-text";
import { cn } from "@/lib/utils";
import { CONTACT_ICONS, contactHref, socialHref } from "./contact-links";
import { Container, Media } from "./primitives";
import { ResourceThumb } from "./resource-thumb";

/*
 * Home page sections after the hero. One frame for all of them — a small
 * label, a plain serif title, a "view all" link and a hairline rule — so the
 * page reads like a well-edited school prospectus, not a set of widgets.
 */

export function HomeSection({
  id,
  label,
  title,
  link,
  muted,
  children,
}: {
  id: string;
  label: string;
  title: string;
  link?: { href: string; label: string };
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        "py-12 sm:py-20",
        muted && "bg-linear-to-b from-transparent via-muted/70 to-transparent",
      )}
    >
      <Container>
        <div className="reveal">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b pb-5 sm:mb-10">
            <div className="grid gap-1.5">
              <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                {label}
              </p>
              <h2
                id={`${id}-title`}
                className="font-serif text-3xl font-medium tracking-tight sm:text-4xl"
              >
                {title}
              </h2>
            </div>
            {link && <ViewAll href={link.href}>{link.label}</ViewAll>}
          </header>
          {children}
        </div>
      </Container>
    </section>
  );
}

function ViewAll({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-sm font-medium hover:text-primary"
    >
      {children}
      <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/* ------------------------------------------------------------------ News */

/** Headlines listed beside the featured story before "See more news". */
const HOME_NEWS_LIST = 4;

export function NewsSection({ news }: { news: News[] }) {
  if (!news.length) return null;
  const [lead, ...rest] = news;
  return (
    <HomeSection id="news" label="News" title="Latest news">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <Link
          href={`${site.news}/${lead.id}`}
          className="group grid content-start gap-4 lg:col-span-7"
        >
          <div className="overflow-hidden rounded-lg border bg-muted">
            <Media
              src={lead.photoUrl}
              alt=""
              className="aspect-16/9 w-full transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
          <div className="grid gap-2">
            <p className="text-xs font-medium text-muted-foreground">{newsDate(lead)}</p>
            <h3 className="font-serif text-2xl leading-snug font-medium text-balance group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4 sm:text-[1.75rem]">
              {lead.title}
            </h3>
            {lead.summary && (
              <p className="line-clamp-2 text-pretty text-muted-foreground">
                {htmlToText(lead.summary)}
              </p>
            )}
          </div>
        </Link>

        <div className="grid content-start gap-5 lg:col-span-5">
          {rest.length > 0 && (
            <ul className="divide-y border-y">
              {rest.slice(0, HOME_NEWS_LIST).map((n) => (
                <li key={n.id}>
                  <Link href={`${site.news}/${n.id}`} className="group flex gap-4 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">{newsDate(n)}</p>
                      <h3 className="mt-1 line-clamp-2 leading-snug font-medium group-hover:text-primary">
                        {n.title}
                      </h3>
                    </div>
                    {n.photoUrl && (
                      <Media
                        src={n.photoUrl}
                        alt=""
                        className="aspect-4/3 w-24 shrink-0 rounded-md border"
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={site.news}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-full border bg-background px-5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
          >
            See more news <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </HomeSection>
  );
}

/* ----------------------------------------------------------------- About */

export function AboutSection({
  school,
  fallbackPhoto,
  fact,
}: {
  school: PublicSchool;
  fallbackPhoto?: string | null;
  fact?: string | null;
}) {
  if (!school?.about && !school?.vision && !school?.mission) return null;
  const photo = school.aboutPhotoUrl ?? fallbackPhoto ?? null;
  const intro = excerpt(school.about, 420) ?? excerpt(school.vision, 420);
  const more = [
    school.history && { href: `${site.about}#history`, label: "Our history" },
    (school.vision || school.mission) && {
      href: `${site.about}#mission`,
      label: "Vision & mission",
    },
    school.coreValues.length > 0 && { href: `${site.about}#values`, label: "Core values" },
    school.namesakeName && {
      href: `${site.about}#namesake`,
      label: `About ${school.namesakeName}`,
    },
  ].filter(Boolean) as Array<{ href: string; label: string }>;

  return (
    <HomeSection id="about" label="About" title={`About ${school.name}`} muted>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="overflow-hidden rounded-lg border bg-muted">
          {photo ? (
            <Media src={photo} alt={school.name} className="aspect-4/3 size-full" />
          ) : (
            <div className="flex aspect-4/3 items-center justify-center bg-background">
              <LogoMark className="h-32" title="" />
            </div>
          )}
        </div>

        <div className="grid content-start gap-6">
          {intro && <p className="text-lg leading-relaxed text-pretty">{intro}</p>}

          <dl
            className={cn(
              "grid border-y text-sm",
              [school.foundedYear, school.motto].filter(Boolean).length === 2
                ? "grid-cols-3"
                : [school.foundedYear, school.motto].some(Boolean)
                  ? "grid-cols-2"
                  : "grid-cols-1",
            )}
          >
            {school.foundedYear && <Fact term="Founded" detail={String(school.foundedYear)} />}
            {school.motto && <Fact term="Motto" detail={school.motto} italic />}
            <Fact term="Location" detail="Freetown, Sierra Leone" />
          </dl>

          {more.length > 0 && (
            <ul className="grid gap-x-6 sm:grid-cols-2">
              {more.map((m) => (
                <li key={m.href}>
                  <Link
                    href={m.href}
                    className="group flex items-center justify-between gap-3 border-b py-3 text-sm font-medium hover:text-primary"
                  >
                    {m.label}
                    <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {fact && (
            <figure className="border-l-2 border-primary pl-4">
              <figcaption className="mb-1 text-xs font-semibold text-primary">
                Did you know?
              </figcaption>
              <blockquote className="text-sm text-pretty text-muted-foreground">{fact}</blockquote>
            </figure>
          )}

          <Link
            href={site.about}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            More about the school <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </HomeSection>
  );
}

function Fact({ term, detail, italic }: { term: string; detail: string; italic?: boolean }) {
  return (
    <div className="grid gap-0.5 py-3 pr-3 [&+&]:border-l [&+&]:pl-3">
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className={cn("font-medium break-words", italic && "italic")}>{detail}</dd>
    </div>
  );
}

/* ------------------------------------------------------------- Resources */

export function ResourcesSection({ resources }: { resources: AcademicResource[] }) {
  if (!resources.length) return null;
  return (
    <HomeSection
      id="resources"
      label="Academics"
      title="Academic resources"
      link={{ href: site.resources, label: "All resources" }}
    >
      <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {resources.slice(0, 6).map((r) => (
          <li key={r.id}>
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex items-start gap-4 border-b py-4"
            >
              <ResourceThumb src={r.photoUrl} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="flex items-start gap-1 font-medium group-hover:text-primary">
                  <span className="line-clamp-1">{r.title}</span>
                  <ArrowUpRightIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                </span>
                {r.description && (
                  <span className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                    {htmlToText(r.description)}
                  </span>
                )}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}

/* ---------------------------------------------------------------- Alumni */

export function AlumniSection({ alumni }: { alumni: Alumnus[] }) {
  if (!alumni.length) return null;
  return (
    <HomeSection
      id="alumni"
      label="Alumni"
      title="Notable alumni"
      link={{ href: site.alumni, label: "All alumni" }}
      muted
    >
      <ul className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
        {alumni.slice(0, 4).map((a) => (
          <li key={a.id}>
            <Link href={`${site.alumni}/${a.id}`} className="group grid gap-3">
              <div className="overflow-hidden rounded-lg border bg-muted">
                <Media
                  src={a.photoUrl}
                  alt=""
                  className={cn(
                    "aspect-4/5 w-full transition-transform duration-500 group-hover:scale-[1.02]",
                    a.isDeceased && "grayscale",
                  )}
                  fallback={<UserIcon className="size-10 opacity-30" />}
                />
              </div>
              <div className="grid gap-0.5">
                <h3 className="leading-snug font-semibold group-hover:text-primary">{a.name}</h3>
                {a.position && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{a.position}</p>
                )}
                {(a.classYear || a.isDeceased) && (
                  <p className="text-xs text-muted-foreground">
                    {[a.classYear && `Class of ${a.classYear}`, lateLabel(a)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}

/* ------------------------------------------------------------ Leadership */

export function LeadershipSection({ leaders }: { leaders: Leader[] }) {
  const current = leaders.find((l) => l.toYear === null);
  const past = leaders.filter((l) => l.toYear !== null);
  if (!current && !past.length) return null;

  return (
    <HomeSection
      id="leadership"
      label="Leadership"
      title="Leadership"
      link={{ href: `${site.about}#leadership`, label: "Leadership history" }}
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        {current && (
          <div className="grid gap-6 sm:grid-cols-[12rem_1fr] lg:col-span-7">
            <div className="overflow-hidden rounded-lg border bg-muted">
              <Media
                src={current.photoUrl}
                alt={current.name}
                className="aspect-4/5 w-full"
                fallback={<UserIcon className="size-10 opacity-30" />}
              />
            </div>
            <div className="grid content-start gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  {current.title} · since {current.fromYear}
                </p>
                <h3 className="font-serif text-2xl font-medium">{current.name}</h3>
              </div>
              {current.summary && (
                <p className="text-pretty text-muted-foreground">{excerpt(current.summary, 360)}</p>
              )}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div className={cn(current ? "lg:col-span-5" : "lg:col-span-12")}>
            <p className="mb-2 text-sm font-semibold">Past principals</p>
            <ul className="divide-y border-y text-sm">
              {past.slice(0, 6).map((l) => (
                <li key={l.id} className="flex items-baseline justify-between gap-4 py-2.5">
                  <span className="font-medium">{l.name}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {l.fromYear}–{l.toYear}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </HomeSection>
  );
}

/* -------------------------------------------------------- Administration */

export function AdministrationSection({ people }: { people: Administrator[] }) {
  if (!people.length) return null;
  return (
    <HomeSection
      id="administration"
      label="Administration"
      title="School administration"
      link={
        people.length > 8
          ? { href: `${site.about}#administration`, label: "Full administration" }
          : undefined
      }
      muted
    >
      <ul className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
        {people.slice(0, 8).map((p) => (
          <li key={p.id} className="flex items-center gap-3">
            <Media
              src={p.photoUrl}
              alt=""
              className="size-14 shrink-0 rounded-full border"
              fallback={<UserIcon className="size-6 opacity-30" />}
            />
            <div className="min-w-0">
              <p className="truncate font-medium">{p.name}</p>
              <p className="line-clamp-2 text-sm text-muted-foreground">{p.position}</p>
            </div>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}

/* --------------------------------------------------------------- Contact */

export function ContactSection({ school }: { school: PublicSchool }) {
  const contacts = school?.contacts ?? [];
  const socials = school?.socialLinks ?? [];

  return (
    <HomeSection id="contact" label="Contact" title="Contact & enquiries">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="grid content-start gap-6 lg:col-span-4">
          <p className="text-pretty text-muted-foreground">
            Questions about admissions, events or the school? Send us a message and the school
            office will get back to you.
          </p>
          {contacts.length > 0 && (
            <ul className="grid gap-4 text-sm">
              {contacts.map((c, i) => {
                const Icon = CONTACT_ICONS[c.type] ?? CONTACT_ICONS.other;
                const href = contactHref(c.type, c.value);
                return (
                  <li key={i} className="flex gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background">
                      <Icon className="size-4 text-primary" aria-hidden />
                    </span>
                    <span className="grid">
                      {c.label && <span className="text-xs text-muted-foreground">{c.label}</span>}
                      {href ? (
                        <a href={href} className="font-medium break-words hover:text-primary">
                          {c.value}
                        </a>
                      ) : (
                        <span className="font-medium whitespace-pre-line">{c.value}</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          {socials.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {socials.map((s, i) => {
                const href = socialHref(s.platform, s.handle);
                const label = SOCIAL_PLATFORMS[s.platform as SocialPlatform] ?? s.platform;
                return (
                  <li key={i}>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="font-medium underline decoration-border underline-offset-4 hover:text-primary hover:decoration-primary"
                      >
                        {label}
                      </a>
                    ) : (
                      <span>
                        {label}: {s.handle}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-lg border bg-card p-5 sm:p-7 lg:col-span-8">
          <h3 className="mb-5 font-medium">Send an enquiry</h3>
          <EnquiryForm />
        </div>
      </div>
    </HomeSection>
  );
}

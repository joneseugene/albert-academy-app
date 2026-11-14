import Link from "next/link";
import { connection } from "next/server";
import { ArrowRightIcon } from "lucide-react";

import { site } from "@/config/routes";
import type { Alumnus } from "@/features/alumni/schemas";
import type { GalleryItem } from "@/features/gallery/schemas";
import { randomIndex, shuffle, weightedPick } from "@/lib/random";
import { PortraitRotator, type HeroPortrait } from "./hero-portraits";
import { AlumniSection, HomeSection } from "./home-sections";

/*
 * Home sections that change order on every visit. The page itself is cached,
 * so these wait for the request (connection()) and stream in; the cached
 * fallback (same layout, fixed order) shows meanwhile, so nothing jumps.
 */

const HOME_ALUMNI = 4;
/** Late alumni are this many times as likely to be picked. */
const LATE_WEIGHT = 3;

export async function RandomAlumni({ alumni }: { alumni: Alumnus[] }) {
  await connection();
  const picked = weightedPick(alumni, HOME_ALUMNI, (a) => (a.isDeceased ? LATE_WEIGHT : 1));
  return <AlumniSection alumni={picked} />;
}

export async function RandomGallery({ items }: { items: GalleryItem[] }) {
  await connection();
  return <GallerySection items={shuffle(items)} />;
}

/* ------------------------------------------------------------- Gallery */

/** Seconds each photo takes to slide past: slow and calm. */
const SECONDS_PER_PHOTO = 7;
/** Enough photos in one loop to fill wide screens. */
const MIN_LOOP = 8;

export function GallerySection({ items }: { items: GalleryItem[] }) {
  const photos = items.filter((g) => g.photoUrl);
  if (!photos.length) return null;

  // Repeat short galleries so one loop is wider than the screen, then run the
  // loop twice: sliding by exactly half makes the motion seamless.
  const loop: GalleryItem[] = [];
  while (loop.length < MIN_LOOP) loop.push(...photos);
  const track = [...loop, ...loop];

  return (
    <HomeSection
      id="gallery"
      label="Gallery"
      title="Life at Albert Academy"
      link={{ href: site.gallery, label: "Full gallery" }}
    >
      <div
        className="group/carousel -mx-4 overflow-hidden mask-[linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] motion-reduce:overflow-x-auto sm:-mx-6"
        aria-label="Photos from school life"
        role="region"
      >
        <ul
          className="flex w-max animate-marquee group-focus-within/carousel:[animation-play-state:paused] group-hover/carousel:[animation-play-state:paused]"
          style={{ animationDuration: `${loop.length * SECONDS_PER_PHOTO}s` }}
        >
          {track.map((g, i) => (
            <li key={i} className="pr-4" aria-hidden={i >= loop.length || undefined}>
              <Link
                href={site.gallery}
                tabIndex={i >= loop.length ? -1 : undefined}
                className="group relative block h-52 w-72 overflow-hidden rounded-2xl border bg-muted sm:h-64 sm:w-88"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.photoUrl!}
                  alt={g.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent px-4 pt-10 pb-3 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {g.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Link
        href={site.gallery}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium hover:text-primary sm:hidden"
      >
        See all photos <ArrowRightIcon className="size-4" />
      </Link>
    </HomeSection>
  );
}

/* ------------------------------------------------------- Hero portraits */

/** The hero's portraits, starting at a random one on every visit. */
export async function RandomPortraits({ people }: { people: HeroPortrait[] }) {
  await connection();
  return <PortraitRotator people={people} start={randomIndex(people.length)} />;
}

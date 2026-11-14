import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  LightbulbIcon,
  MapPinIcon,
  MusicIcon,
} from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { Container, Media, PillLink } from "@/components/site/primitives";
import { site } from "@/config/routes";
import type { PublicSchool } from "@/features/site/server/queries";
import { cn } from "@/lib/utils";
import { PortraitRotator, type HeroPortrait } from "./hero-portraits";
import { RandomPortraits } from "./home-random";

type Props = {
  school: PublicSchool;
  /** Latest published news item, for the announcement chip. */
  latest?: { id: string; title: string } | null;
  /** Up to two photos for the collage (gallery first, then news covers). */
  photos: string[];
  /** Namesake and former principals: the large photo rotates through them. */
  portraits: HeroPortrait[];
  fact?: string | null;
  lead?: string | null;
};

/** Landing hero: copy on the left, a photo collage with small floating cards on the right. */
export function HomeHero({ school, latest, photos, portraits, fact, lead }: Props) {
  const name = school?.name ?? "Albert Academy Secondary School";
  const [first, ...rest] = name.split(/\s+(?=Secondary)/);
  const motto = school?.motto ?? "Esse quam videri";

  return (
    // The aura: soft burgundy and gold light behind the hero.
    <section className="aura overflow-hidden border-b">
      <Container className="grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
        {/* ---------- Copy ---------- */}
        <div className="grid justify-items-start gap-5">
          {latest && (
            <Link
              href={`${site.news}/${latest.id}`}
              className="group inline-flex max-w-full items-center gap-2 rounded-full border bg-background/80 py-0.5 pr-3 pl-0.5 text-xs backdrop-blur hover:bg-muted"
            >
              <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                Latest
              </span>
              <span className="truncate">{latest.title}</span>
              <ArrowRightIcon className="size-3 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}

          <h1 className="font-serif text-4xl leading-[1.05] font-medium tracking-tight text-balance sm:text-5xl xl:text-6xl">
            {first}
            {rest.length > 0 && (
              <span className="block text-muted-foreground/80">{rest.join(" ")}</span>
            )}
          </h1>

          {lead && (
            <p className="line-clamp-4 max-w-lg text-base text-pretty text-muted-foreground sm:text-lg">
              {lead}
            </p>
          )}

          <div className="flex flex-wrap gap-2.5">
            <PillLink href={site.about} size="sm">
              Discover our story <ArrowRightIcon />
            </PillLink>
            <PillLink href={site.song} size="sm" variant="outline">
              <MusicIcon /> School song
            </PillLink>
          </div>

          {/* Quick facts strip */}
          <dl
            className={cn(
              "mt-3 grid w-full max-w-lg divide-x rounded-2xl border bg-background/70 backdrop-blur",
              school?.foundedYear ? "grid-cols-3" : "grid-cols-2",
            )}
          >
            {school?.foundedYear && <HeroStat label="Founded" value={String(school.foundedYear)} />}
            <HeroStat label="Motto" value={motto} italic />
            <HeroStat
              label="Campus"
              value={
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="size-3.5 text-primary" /> Freetown
                </span>
              }
            />
          </dl>
        </div>

        {/* ---------- Collage ---------- */}
        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="grid h-80 grid-cols-5 grid-rows-2 gap-3 sm:h-104">
            <Tile className="col-span-3 row-span-2">
              {portraits.length > 0 ? (
                // Random first portrait per visit; the cached page shows the first meanwhile.
                <Suspense fallback={<PortraitRotator people={portraits} start={0} />}>
                  <RandomPortraits people={portraits} />
                </Suspense>
              ) : photos[0] ? (
                <Media src={photos[0]} alt="" className="size-full" />
              ) : (
                <CrestPanel />
              )}
            </Tile>

            <Link
              href={site.about}
              className="group col-span-2 flex flex-col justify-between rounded-3xl bg-primary p-4 text-primary-foreground sm:p-5"
            >
              <span className="flex items-center justify-between text-[11px] font-medium tracking-wider uppercase opacity-80">
                Since
                <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span>
                <span className="block text-3xl font-semibold tracking-tight sm:text-4xl">
                  {school?.foundedYear ?? "Est."}
                </span>
                <span className="mt-1 block text-xs italic opacity-80 sm:text-sm">{motto}</span>
              </span>
            </Link>

            <Tile className="col-span-2">
              {photos[1] ? (
                <Media src={photos[1]} alt="" className="size-full" />
              ) : (
                <div className="flex size-full items-center justify-center bg-muted">
                  <LogoMark className="h-16 opacity-90" title="" />
                </div>
              )}
            </Tile>
          </div>

          {/* Floating: school song */}
          <Link
            href={site.song}
            className="group absolute -bottom-5 left-3 flex items-center gap-3 rounded-2xl border bg-background/90 p-2 pr-4 backdrop-blur sm:left-6"
          >
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <MusicIcon className="size-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-[11px] text-muted-foreground">Listen now</span>
              <span className="block max-w-40 truncate text-sm font-medium">
                {school?.songTitle ?? "The School Song"}
              </span>
            </span>
            <span className="ml-1 flex h-4 items-end gap-0.5" aria-hidden>
              {[60, 100, 40, 80].map((h, i) => (
                <span
                  key={i}
                  className="w-0.5 rounded-full bg-primary/70"
                  style={{ height: `${h}%` }}
                />
              ))}
            </span>
          </Link>

          {/* Floating: did you know? */}
          {fact && (
            <div className="absolute -top-5 right-3 hidden max-w-60 rounded-2xl border bg-background/90 p-3 backdrop-blur sm:block lg:-right-4">
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                <LightbulbIcon className="size-3.5" /> Did you know?
              </p>
              <p className="line-clamp-3 text-xs leading-relaxed">{fact}</p>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

function HeroStat({
  label,
  value,
  italic,
}: {
  label: string;
  value: React.ReactNode;
  italic?: boolean;
}) {
  return (
    <div className="grid min-w-0 gap-0.5 px-3 py-2.5 sm:px-4">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className={cn("truncate text-sm font-medium", italic && "italic")}>{value}</dd>
    </div>
  );
}

function Tile({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("overflow-hidden rounded-3xl border bg-muted", className)}>{children}</div>
  );
}

function CrestPanel() {
  return (
    <div className="flex size-full items-center justify-center bg-linear-to-br from-accent via-background to-muted">
      <LogoMark className="h-32 sm:h-40" title="" />
    </div>
  );
}

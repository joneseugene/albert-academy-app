"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, MusicIcon, XIcon } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { site } from "@/config/routes";
import { cn } from "@/lib/utils";

export const SITE_LINKS = [
  { href: site.about, label: "About" },
  { href: site.news, label: "News" },
  { href: site.activities, label: "Activities" },
  { href: site.gallery, label: "Gallery" },
  { href: site.alumni, label: "Alumni" },
  { href: site.resources, label: "Resources" },
  { href: site.notices, label: "Notices" },
  { href: site.live, label: "Live" },
  { href: `${site.home}#contact`, label: "Contact" },
] as const;

const onScroll = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
};

/** Header that highlights the current page. Render inside <Suspense> (reads the URL). */
export function SiteHeader({ liveNow = false }: { liveNow?: boolean }) {
  return <HeaderView pathname={usePathname()} liveNow={liveNow} />;
}

/** The same header without an active link — the Suspense fallback for prerendering. */
export function HeaderView({
  pathname,
  liveNow = false,
}: {
  pathname: string | null;
  /** A stream is live: the "Live" link gets a red dot. */
  liveNow?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  // Close the mobile menu after navigating.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  const scrolled = useSyncExternalStore(
    onScroll,
    () => window.scrollY > 8,
    () => false,
  );
  const active = (href: string) =>
    pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color] duration-500",
        scrolled || open
          ? "border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70"
          : "border-transparent bg-transparent",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl items-center gap-6 px-4 transition-[height] duration-500 sm:px-6",
          scrolled ? "h-14" : "h-16",
        )}
      >
        <Link
          href={site.home}
          className="flex items-center gap-2.5"
          aria-label="Albert Academy home"
        >
          <LogoMark className="h-9" title="" />
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight">Albert Academy</span>
            <span className="block text-[11px] text-muted-foreground">Esse quam videri</span>
          </span>
        </Link>

        <nav aria-label="Main" className="ml-auto hidden items-center gap-0.5 xl:flex">
          {SITE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                active(l.href) && "bg-muted font-medium text-foreground",
              )}
            >
              {l.label}
              {liveNow && l.href === site.live && <LiveDot />}
            </Link>
          ))}
        </nav>

        <Link
          href={site.song}
          className="ml-auto hidden h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex xl:ml-0"
        >
          <MusicIcon className="size-4" /> School Song
        </Link>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="ml-auto inline-flex size-10 items-center justify-center rounded-full border sm:ml-0 xl:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
        </button>
      </div>

      {open && (
        <nav aria-label="Main" className="border-t bg-background xl:hidden">
          <div className="mx-auto grid max-w-6xl gap-1 px-4 py-4 sm:px-6">
            {SITE_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-xl px-4 py-3 text-base",
                  active(l.href) ? "bg-muted font-medium" : "hover:bg-muted",
                )}
              >
                {l.label}
                {liveNow && l.href === site.live && <LiveDot />}
              </Link>
            ))}
            <Link
              href={site.song}
              className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground sm:hidden"
            >
              <MusicIcon className="size-4" /> School Song
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

function LiveDot() {
  return (
    <span className="relative ml-1.5 inline-flex size-2 align-middle" aria-label="(live now)">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75 motion-reduce:animate-none" />
      <span className="relative inline-flex size-2 rounded-full bg-red-600" />
    </span>
  );
}

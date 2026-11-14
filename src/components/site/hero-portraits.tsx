"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type HeroPortrait = {
  name: string;
  /** e.g. "Our namesake" or "Principal, 1952–1968". */
  role: string;
  photoUrl: string;
};

const SECONDS = 7;

/**
 * The hero's large photo: the school's namesake and former principals,
 * cross-fading slowly from a (server-chosen) random first portrait. Pauses on
 * hover; stays still for visitors who prefer reduced motion.
 */
export function PortraitRotator({ people, start }: { people: HeroPortrait[]; start: number }) {
  const [index, setIndex] = useState(start % people.length);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (people.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % people.length), SECONDS * 1000);
    return () => clearInterval(timer);
  }, [people.length, paused]);

  return (
    <figure
      className="relative size-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {people.map((p, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={p.photoUrl + i}
          src={p.photoUrl}
          alt={i === index ? p.name : ""}
          aria-hidden={i !== index}
          loading={i === index ? "eager" : "lazy"}
          className={cn(
            "absolute inset-0 size-full object-cover object-[50%_25%] transition-[opacity,transform] duration-[1600ms] ease-out",
            i === index ? "scale-100 opacity-100" : "scale-[1.03] opacity-0",
          )}
        />
      ))}
      <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/25 to-transparent px-4 pt-14 pb-3.5 text-white">
        <span
          key={index}
          className="grid animate-in gap-0.5 duration-700 fade-in slide-in-from-bottom-1"
        >
          <span className="font-serif text-lg leading-tight font-medium">{people[index].name}</span>
          <span className="text-xs opacity-80">{people[index].role}</span>
        </span>
      </figcaption>
      {people.length > 1 && (
        <span className="absolute top-3 right-3 flex gap-1" aria-hidden>
          {people.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 rounded-full bg-white transition-all duration-500",
                i === index ? "w-4 opacity-90" : "w-1 opacity-50",
              )}
            />
          ))}
        </span>
      )}
    </figure>
  );
}

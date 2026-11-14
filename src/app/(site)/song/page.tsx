import type { Metadata } from "next";

import { Container, EmptyState, Section } from "@/components/site/primitives";
import { SongPlayer } from "@/components/site/song-player";
import { getSchool } from "@/features/site/server/queries";

export const metadata: Metadata = {
  title: "School song",
  description: "Listen to the Albert Academy school song and sing along with the lyrics.",
};

export default async function SongPage() {
  const school = await getSchool();
  const hasSong = Boolean(school?.songAudioUrl || school?.songLyrics);

  return (
    <>
      <section className="pt-12 sm:pt-20">
        <Container className="grid max-w-3xl justify-items-center gap-3 text-center">
          <span className="inline-flex rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            School song
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            {school?.songTitle ?? "Our school song"}
          </h1>
          <p className="text-lg text-muted-foreground">
            Press play and turn on the lyrics to sing along.
          </p>
        </Container>
      </section>
      <Section className="pt-10 sm:pt-12">
        <Container className="max-w-3xl px-0 sm:px-0">
          {hasSong ? (
            <SongPlayer
              title={school?.songTitle ?? "Albert Academy School Song"}
              credits={school?.songCredits}
              audioUrl={school?.songAudioUrl}
              lyrics={school?.songLyrics}
              defaultShowLyrics
            />
          ) : (
            <EmptyState>The school song will be available here soon.</EmptyState>
          )}
        </Container>
      </Section>
    </>
  );
}

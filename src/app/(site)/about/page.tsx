import type { Metadata } from "next";
import { QuoteIcon, UserIcon } from "lucide-react";

import { PersonCard } from "@/components/site/cards";
import { FactsGrid } from "@/components/site/facts-marquee";
import {
  Container,
  EmptyState,
  Media,
  PageHero,
  Prose,
  Section,
  SectionHeading,
} from "@/components/site/primitives";
import { getAdministrators, getFacts, getLeaders, getSchool } from "@/features/site/server/queries";
import { htmlToText } from "@/lib/rich-text";

export const metadata: Metadata = {
  title: "About",
  description: "Our story, vision, mission, values, history and leadership.",
};

export default async function AboutPage() {
  const [school, leaders, administrators, facts] = await Promise.all([
    getSchool(),
    getLeaders(),
    getAdministrators(),
    getFacts(),
  ]);
  const name = school?.name ?? "Albert Academy Secondary School";
  const current = leaders.filter((l) => l.toYear === null);
  const past = leaders.filter((l) => l.toYear !== null);

  const toc = [
    school?.about && { id: "about", label: "About" },
    (school?.vision || school?.mission) && { id: "mission", label: "Vision & mission" },
    school?.coreValues.length && { id: "values", label: "Core values" },
    school?.history && { id: "history", label: "History" },
    school?.namesakeName && { id: "namesake", label: "Our namesake" },
    leaders.length && { id: "leadership", label: "Leadership" },
    administrators.length && { id: "administration", label: "Administration" },
    facts.length && { id: "did-you-know", label: "Did you know?" },
  ].filter(Boolean) as Array<{ id: string; label: string }>;

  return (
    <>
      <PageHero
        eyebrow={
          school?.foundedYear ? `Founded ${school.foundedYear}` : (school?.motto ?? "About us")
        }
        title={name}
        description={school?.motto ? `“${school.motto}”` : undefined}
      >
        {toc.length > 1 && (
          <nav aria-label="On this page" className="mt-4 flex flex-wrap gap-2">
            {toc.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="rounded-full border bg-background px-3.5 py-1.5 text-sm hover:bg-muted"
              >
                {t.label}
              </a>
            ))}
          </nav>
        )}
      </PageHero>

      {toc.length === 0 && (
        <Section>
          <EmptyState>The school&apos;s story will appear here soon.</EmptyState>
        </Section>
      )}

      {school?.about && (
        <Section id="about" className="scroll-mt-16">
          <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-16">
            <h2 className="text-2xl font-semibold tracking-tight">About the school</h2>
            <div className="grid max-w-3xl gap-8">
              {school.aboutPhotoUrl && (
                <Media
                  src={school.aboutPhotoUrl}
                  alt={`${school.name}`}
                  className="aspect-16/9 w-full rounded-3xl border"
                />
              )}
              <Prose html={school.about} />
            </div>
          </div>
        </Section>
      )}

      {(school?.vision || school?.mission) && (
        <Section id="mission" muted className="scroll-mt-16">
          <div className="grid gap-5 md:grid-cols-2">
            {school?.vision && (
              <article
                id="vision"
                className="grid content-start gap-4 rounded-3xl border bg-card p-8 sm:p-10"
              >
                <p className="text-sm font-semibold text-primary">Our vision</p>
                <Prose html={school.vision} className="text-xl sm:text-2xl" />
              </article>
            )}
            {school?.mission && (
              <article className="grid content-start gap-4 rounded-3xl border bg-card p-8 sm:p-10">
                <p className="text-sm font-semibold text-primary">Our mission</p>
                <Prose html={school.mission} className="text-xl sm:text-2xl" />
              </article>
            )}
          </div>
        </Section>
      )}

      {school && school.coreValues.length > 0 && (
        <Section id="values" className="scroll-mt-16">
          <SectionHeading eyebrow="Core values" title="What we stand for." />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {school.coreValues.map((v, i) => (
              <li key={v} className="flex items-center gap-4 rounded-2xl border bg-card p-5">
                <span className="text-sm font-semibold text-primary tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-lg font-medium">{v}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {school?.history && (
        <Section id="history" muted className="scroll-mt-16">
          <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-16">
            <h2 className="text-2xl font-semibold tracking-tight">Our history</h2>
            <Prose html={school.history} className="max-w-3xl" />
          </div>
        </Section>
      )}

      {school?.namesakeName && (
        <Section id="namesake" className="scroll-mt-16">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="overflow-hidden rounded-4xl border bg-muted">
              <Media
                src={school.namesakePhotoUrl}
                alt={school.namesakeName}
                className="aspect-4/5 w-full"
                fallback={<UserIcon className="size-16 opacity-30" />}
              />
            </div>
            <div className="grid content-start gap-5">
              <SectionHeading eyebrow="Our namesake" title={school.namesakeName} />
              {(school.namesakeBirth || school.namesakeDeath) && (
                <dl className="-mt-6 flex flex-wrap gap-3 text-sm">
                  {school.namesakeBirth && (
                    <div className="rounded-full border px-4 py-1.5">
                      <dt className="inline text-muted-foreground">Born </dt>
                      <dd className="inline font-medium">{school.namesakeBirth}</dd>
                    </div>
                  )}
                  {school.namesakeDeath && (
                    <div className="rounded-full border px-4 py-1.5">
                      <dt className="inline text-muted-foreground">Died </dt>
                      <dd className="inline font-medium">{school.namesakeDeath}</dd>
                    </div>
                  )}
                </dl>
              )}
              <Prose html={school.namesakeAbout} />
            </div>
          </div>
        </Section>
      )}

      {leaders.length > 0 && (
        <Section id="leadership" muted className="scroll-mt-16">
          <SectionHeading
            eyebrow="Leadership"
            title="Those who have led us."
            description="Our principals, from today back through the years."
          />
          {current.length > 0 && (
            <div className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {current.map((l) => (
                <PersonCard
                  key={l.id}
                  name={l.name}
                  role={`${l.title} · since ${l.fromYear}`}
                  photoUrl={l.photoUrl}
                  note={htmlToText(l.summary)}
                />
              ))}
            </div>
          )}
          {past.length > 0 && (
            <ol className="relative grid gap-4 border-l pl-6 sm:pl-8">
              {past.map((l) => (
                <li
                  key={l.id}
                  className="relative grid gap-4 rounded-3xl border bg-card p-5 sm:grid-cols-[5rem_1fr] sm:p-6"
                >
                  <span
                    className="absolute top-8 -left-[calc(1.5rem+5px)] size-2.5 rounded-full bg-primary sm:-left-[calc(2rem+5px)]"
                    aria-hidden
                  />
                  <Media
                    src={l.photoUrl}
                    alt=""
                    className="size-20 rounded-2xl"
                    fallback={<UserIcon className="size-8 opacity-30" />}
                  />
                  <div className="grid content-start gap-1">
                    <p className="text-sm font-medium text-primary tabular-nums">
                      {l.fromYear}–{l.toYear}
                    </p>
                    <p className="text-lg font-semibold tracking-tight">{l.name}</p>
                    <p className="text-sm text-muted-foreground">{l.title}</p>
                    {l.summary && <Prose html={l.summary} className="mt-2 sm:text-base" />}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Section>
      )}

      {administrators.length > 0 && (
        <Section id="administration" className="scroll-mt-16">
          <SectionHeading eyebrow="Administration" title="The team running the school." />
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {administrators.map((a) => (
              <PersonCard key={a.id} name={a.name} role={a.position} photoUrl={a.photoUrl} />
            ))}
          </div>
        </Section>
      )}

      {facts.length > 0 && (
        <Section id="did-you-know" muted className="scroll-mt-16">
          <SectionHeading eyebrow="Did you know?" title="Things you might not know about us." />
          <FactsGrid facts={facts} />
        </Section>
      )}

      {school?.motto && (
        <section className="py-16 sm:py-24">
          <Container className="grid justify-items-center gap-4 text-center">
            <QuoteIcon className="size-8 text-primary" aria-hidden />
            <p className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              {school.motto}
            </p>
          </Container>
        </section>
      )}
    </>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";

import { HomeHero } from "@/components/site/home-hero";
import {
  AboutSection,
  AdministrationSection,
  AlumniSection,
  ContactSection,
  LeadershipSection,
  NewsSection,
  ResourcesSection,
} from "@/components/site/home-sections";
import { GallerySection, RandomAlumni, RandomGallery } from "@/components/site/home-random";
import { LiveBanner } from "@/components/site/live";
import {
  getAdministrators,
  getAlumni,
  getFacts,
  getGallery,
  getLeaders,
  getLivestreams,
  getNews,
  getResources,
  getSchool,
} from "@/features/site/server/queries";
import { excerpt } from "@/lib/rich-text";

export const metadata: Metadata = {
  title: { absolute: "Albert Academy Secondary School" },
  description:
    "Albert Academy Secondary School, Freetown: news, our history, leadership, notable alumni and how to get in touch.",
};

export default async function HomePage() {
  const [school, news, gallery, alumni, leaders, administrators, facts, resources, streams] =
    await Promise.all([
      getSchool(),
      getNews(5),
      getGallery(),
      getAlumni(),
      getLeaders(),
      getAdministrators(),
      getFacts(),
      getResources(),
      getLivestreams(),
    ]);

  // Hero portraits: the school's namesake, then former principals (with photos).
  const portraits = [
    school?.namesakeName && school.namesakePhotoUrl
      ? { name: school.namesakeName, role: "Our namesake", photoUrl: school.namesakePhotoUrl }
      : null,
    ...leaders
      .filter((l) => l.toYear !== null && l.photoUrl)
      .map((l) => ({
        name: l.name,
        role: `${l.title}, ${l.fromYear}–${l.toYear}`,
        photoUrl: l.photoUrl!,
      })),
  ].filter((p): p is NonNullable<typeof p> => p !== null);

  const heroPhotos = [...gallery.map((g) => g.photoUrl), ...news.map((n) => n.photoUrl)]
    .filter((url): url is string => Boolean(url))
    .slice(0, 2);

  return (
    <>
      <LiveBanner streams={streams} />
      <HomeHero
        school={school}
        latest={news[0]}
        photos={heroPhotos}
        portraits={portraits}
        fact={facts[0]?.fact}
        lead={excerpt(school?.about) ?? excerpt(school?.vision)}
      />

      <NewsSection news={news} />
      <AboutSection school={school} fallbackPhoto={gallery[2]?.photoUrl} fact={facts[1]?.fact} />
      <ResourcesSection resources={resources} />
      {/* Random on every visit (late alumni favoured); stored order shows meanwhile. */}
      <Suspense fallback={<AlumniSection alumni={alumni} />}>
        <RandomAlumni alumni={alumni} />
      </Suspense>
      <LeadershipSection leaders={leaders} />
      <AdministrationSection people={administrators} />
      <Suspense fallback={<GallerySection items={gallery} />}>
        <RandomGallery items={gallery} />
      </Suspense>
      <ContactSection school={school} />
    </>
  );
}

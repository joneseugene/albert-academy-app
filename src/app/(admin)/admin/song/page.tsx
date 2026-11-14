import { Suspense } from "react";
import type { Metadata } from "next";
import { MusicIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { SongForm } from "@/features/song/components/song-form";
import { songService } from "@/features/song/server/service";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "School song" };

export default function SongPage() {
  return (
    <>
      <PageHeader
        title="School Song"
        description="The recording and lyrics visitors can play on the website"
        icon={MusicIcon}
      />
      <Suspense fallback={<FormSkeleton />}>
        <SongDetails />
      </Suspense>
    </>
  );
}

async function SongDetails() {
  await requirePermission("school.read");
  return <SongForm song={await songService.get()} />;
}

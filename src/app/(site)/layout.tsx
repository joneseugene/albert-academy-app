import { Suspense } from "react";

import { LivePopup } from "@/components/site/live-popup";
import { NoticePopup } from "@/components/site/notice-popup";
import { ScrollToTop } from "@/components/site/scroll-to-top";
import { SiteFooter } from "@/components/site/site-footer";
import { HeaderView, SiteHeader } from "@/components/site/site-header";
import { getLivestreams, getNotices, getSchool } from "@/features/site/server/queries";
import { excerpt } from "@/lib/rich-text";

/** Public website shell: header, page, footer. Data is cached, so this prerenders. */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [school, streams, notices] = await Promise.all([
    getSchool(),
    getLivestreams(),
    getNotices(),
  ]);
  // Notices that may pop up; the browser checks the period and "don't show again".
  const popupNotices = notices
    .filter((n) => n.showBanner)
    .map((n) => ({
      id: n.id,
      title: n.title,
      excerpt: excerpt(n.body, 360),
      publishedAt: n.publishedAt,
      bannerFrom: n.bannerFrom,
      bannerUntil: n.bannerUntil,
    }));
  const live =
    streams.find((s) => s.status === "live" && s.isFeatured) ??
    streams.find((s) => s.status === "live");

  return (
    <div className="site-aura flex min-h-full flex-1 flex-col bg-background">
      {/* The active-link highlight needs the URL; the static header shows meanwhile. */}
      <Suspense fallback={<HeaderView pathname={null} liveNow={Boolean(live)} />}>
        <SiteHeader liveNow={Boolean(live)} />
      </Suspense>
      <main className="flex-1">{children}</main>
      <SiteFooter school={school} />
      <ScrollToTop raised={Boolean(live)} />
      {popupNotices.length > 0 && (
        <Suspense fallback={null}>
          <NoticePopup notices={popupNotices} />
        </Suspense>
      )}
      {live && (
        <Suspense fallback={null}>
          <LivePopup
            stream={{
              id: live.id,
              title: live.title,
              sourceUrl: live.sourceUrl,
              options: {
                autoplay: live.autoplay,
                startMuted: live.startMuted,
                showControls: live.showControls,
                showChat: live.showChat,
                privacyMode: live.privacyMode,
              },
            }}
          />
        </Suspense>
      )}
    </div>
  );
}

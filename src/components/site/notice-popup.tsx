"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRightIcon, MegaphoneIcon } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { site } from "@/config/routes";
import { formatDate } from "@/lib/format";

export type PopupNotice = {
  id: string;
  title: string;
  excerpt: string | null;
  publishedAt: Date | null;
  bannerFrom: Date | null;
  bannerUntil: Date | null;
};

/*
 * Pops up the newest public notice whose banner period is current, once the
 * site loads. Decided in the visitor's browser (cached pages don't know the
 * time). "Don't show again" is remembered on this device; plain Close hides
 * it until the next visit.
 */

const EVENT = "aa-notice-popup";
const hiddenKey = (id: string) => `aa-notice-hidden:${id}`; // localStorage: for good
const closedKey = (id: string) => `aa-notice-closed:${id}`; // sessionStorage: this visit

function stored(storage: () => Storage, key: string) {
  try {
    return storage().getItem(key) === "1";
  } catch {
    return false;
  }
}

function remember(id: string, forGood: boolean) {
  try {
    if (forGood) localStorage.setItem(hiddenKey(id), "1");
    sessionStorage.setItem(closedKey(id), "1");
  } catch {
    // Storage blocked: it simply shows again next time.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Id of the notice to pop up now, or null. */
function pick(notices: PopupNotice[]) {
  const now = Date.now();
  const due = notices.find(
    (n) =>
      (!n.bannerFrom || n.bannerFrom.getTime() <= now) &&
      (!n.bannerUntil || n.bannerUntil.getTime() >= now) &&
      !stored(() => localStorage, hiddenKey(n.id)) &&
      !stored(() => sessionStorage, closedKey(n.id)),
  );
  return due?.id ?? null;
}

export function NoticePopup({ notices }: { notices: PopupNotice[] }) {
  const pathname = usePathname();
  const [dontShow, setDontShow] = useState(false);
  // Server render: nothing (the decision needs the visitor's clock and storage).
  const id = useSyncExternalStore(
    subscribe,
    () => pick(notices),
    () => null,
  );
  const notice = notices.find((n) => n.id === id);
  // No pop-up on the notice's own page.
  if (!notice || pathname === `${site.notices}/${notice.id}`) return null;

  const close = () => remember(notice.id, dontShow);

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="aura border-b px-6 pt-6 pb-5">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            <MegaphoneIcon className="size-4" /> Public notice
          </p>
          <DialogTitle className="font-serif text-2xl leading-snug font-medium text-balance">
            {notice.title}
          </DialogTitle>
          {notice.publishedAt && (
            <p className="mt-1.5 text-xs text-muted-foreground">{formatDate(notice.publishedAt)}</p>
          )}
        </div>
        <div className="grid gap-5 px-6 py-5">
          {notice.excerpt ? (
            <DialogDescription className="line-clamp-5 text-sm leading-relaxed text-pretty text-foreground/85">
              {notice.excerpt}
            </DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{notice.title}</DialogDescription>
          )}
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
            <Checkbox checked={dontShow} onCheckedChange={(v) => setDontShow(v === true)} />
            Don&apos;t show this again
          </label>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={close}
              className="inline-flex h-10 items-center justify-center rounded-full border px-5 text-sm font-medium hover:bg-muted"
            >
              Close
            </button>
            <Link
              href={`${site.notices}/${notice.id}`}
              onClick={close}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Read the full notice <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

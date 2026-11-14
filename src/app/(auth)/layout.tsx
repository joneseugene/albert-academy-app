import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { site } from "@/config/routes";

/**
 * Sign-in, forgot and reset password. Large screens: a burgundy brand panel
 * beside the form. Phones: one calm column with a small crest.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* ---------- Brand panel (lg+) ---------- */}
      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.07)_1px,transparent_1px)] mask-[radial-gradient(ellipse_80%_70%_at_30%_40%,black,transparent)] bg-size-[40px_40px]"
        />
        <LogoMark
          title=""
          className="pointer-events-none absolute -right-24 -bottom-20 h-[28rem] opacity-[0.07] brightness-0 invert"
        />

        <Link href={site.home} className="relative flex w-fit items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white">
            <LogoMark className="h-7" title="" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold">Albert Academy</span>
            <span className="block text-xs opacity-75">Secondary School</span>
            <span className="block text-xs opacity-75">Freetown</span>
          </span>
        </Link>

        <div className="relative grid max-w-md gap-4">
          <p className="text-4xl leading-tight font-semibold tracking-tight text-balance xl:text-5xl">
            ESSE QUAM VIDERI
          </p>
          <p className="text-base opacity-80">Rather to be, than to seem.</p>
        </div>

        <p className="relative text-xs opacity-60">Albert Academy Secondary School</p>
      </aside>

      {/* ---------- Form side ---------- */}
      <main className="flex min-h-svh flex-col bg-background px-4 py-5 sm:px-8 lg:min-h-0">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={site.home}
            className="flex items-center gap-2 lg:hidden"
            aria-label="Albert Academy home"
          >
            <LogoMark className="h-8" title="" />
            <span className="text-sm font-semibold tracking-tight">Albert Academy</span>
          </Link>
          <Link
            href={site.home}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" /> Back to website
          </Link>
        </div>

        <div className="mx-auto my-auto w-full max-w-sm py-10">{children}</div>
      </main>
    </div>
  );
}

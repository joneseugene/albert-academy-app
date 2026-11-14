"use client";

import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { findNavItem, navigationFor } from "@/config/navigation";
import { routes } from "@/config/routes";
import { UserMenu } from "@/features/auth/components/user-menu";
import { useCurrentUser } from "@/providers/session-provider";
import { ThemeToggle } from "./theme-toggle";

const EXTRA_TITLES: Record<string, string> = {
  [routes.profile]: "Profile",
  [routes.changePassword]: "Change password",
  [routes.forbidden]: "Access denied",
};

/** Sticky top bar: sidebar toggle, breadcrumb, theme, account. */
export function SiteHeader() {
  const user = useCurrentUser();
  const pathname = usePathname();
  const item = findNavItem(pathname, navigationFor(user));
  const title = EXTRA_TITLES[pathname] ?? item?.title;
  const group = EXTRA_TITLES[pathname] ? undefined : item?.group;

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-5" />
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex items-center gap-1.5 text-sm">
          {group && group !== "Overview" && (
            <>
              <li className="hidden text-muted-foreground sm:block">{group}</li>
              <li className="hidden text-muted-foreground sm:block" aria-hidden>
                /
              </li>
            </>
          )}
          <li className="truncate font-medium">{title}</li>
        </ol>
      </nav>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}

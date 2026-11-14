import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRightIcon, LayoutDashboardIcon, PlusIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { RelativeTime } from "@/components/shared/relative-time";
import { StatusBadge } from "@/components/shared/status-badge";
import { Thumbnail } from "@/components/shared/thumbnail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { navigation } from "@/config/navigation";
import type { Permission } from "@/config/permissions";
import { routes } from "@/config/routes";
import { activitiesService } from "@/features/activities/server/service";
import { administrationService } from "@/features/administration/server/service";
import { alumniService } from "@/features/alumni/server/service";
import { factsService } from "@/features/facts/server/service";
import { galleryService } from "@/features/gallery/server/service";
import { leadershipService } from "@/features/leadership/server/service";
import { newsService } from "@/features/news/server/service";
import { resourcesService } from "@/features/resources/server/service";
import { usersService } from "@/features/users/server/service";
import { hasPermission, type CurrentUser } from "@/lib/auth/access";
import { formatNumber } from "@/lib/format";
import { requireUser } from "@/server/auth/session";

export const metadata: Metadata = { title: "Dashboard" };

type Counted = { list: (q: { pageSize: number }) => Promise<{ total: number }> };

/** One tile per module: [href, permission, service]. Titles/icons come from the nav config. */
const TILES: Array<[string, Permission, Counted]> = [
  [routes.news, "news.read", newsService],
  [routes.activities, "activities.read", activitiesService],
  [routes.gallery, "gallery.read", galleryService],
  [routes.resources, "resources.read", resourcesService],
  [routes.facts, "facts.read", factsService],
  [routes.alumni, "alumni.read", alumniService],
  [routes.leadership, "leadership.read", leadershipService],
  [routes.administration, "administration.read", administrationService],
  [routes.users, "users.read", usersService],
];

const navItem = (href: string) =>
  navigation.flatMap((g) => g.items).find((item) => item.href === href)!;

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Dashboard" icon={LayoutDashboardIcon} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TILES.map(([href]) => (
              <Skeleton key={href} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-72 w-full" />
        </>
      }
    >
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const me = await requireUser();
  const tiles = TILES.filter(([, permission]) => hasPermission(me, permission));
  const counts = await Promise.all(
    tiles.map(([, , service]) =>
      service
        .list({ pageSize: 1 })
        .then((page) => page.total)
        .catch(() => null),
    ),
  );

  return (
    <>
      <PageHeader
        title={`Welcome, ${me.firstName}`}
        description="Albert Academy website content at a glance"
        icon={LayoutDashboardIcon}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(([href], i) => {
          const item = navItem(href);
          return (
            <Link
              key={href}
              href={href}
              className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Card className="gap-2 py-5 transition-colors group-hover:border-primary/40 group-hover:bg-accent/40">
                <CardHeader className="flex flex-row items-center justify-between px-5">
                  <CardDescription>{item.title}</CardDescription>
                  <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <item.icon className="size-4" aria-hidden />
                  </span>
                </CardHeader>
                <CardContent className="px-5">
                  <p className="text-3xl font-semibold tabular-nums">
                    {counts[i] === null ? "" : formatNumber(counts[i])}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {hasPermission(me, "news.read") && <LatestNews />}
        <QuickActions me={me} />
      </div>
    </>
  );
}

async function LatestNews() {
  const { items } = await newsService.list({
    pageSize: 5,
    sort: [{ field: "updatedAt", direction: "desc" }],
  });
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="grid gap-1">
          <CardTitle>Latest news</CardTitle>
          <CardDescription>Recently edited articles</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href={routes.news}>
            View all <ArrowRightIcon />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
            No articles yet.
          </p>
        ) : (
          <ul className="divide-y">
            {items.map((n) => (
              <li key={n.id}>
                <Link
                  href={`${routes.news}/${n.id}/edit`}
                  className="flex items-center gap-3 py-3 hover:text-primary"
                >
                  <Thumbnail src={n.photoUrl} alt="" className="h-10 w-14" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{n.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      Edited <RelativeTime value={n.updatedAt} />
                    </span>
                  </span>
                  <StatusBadge status={n.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

const QUICK: Array<[string, string, Permission]> = [
  ["New article", `${routes.news}/new`, "news.create"],
  ["Add activity", `${routes.activities}/new`, "activities.create"],
  ["Add gallery photo", `${routes.gallery}/new`, "gallery.create"],
  ["Add academic resource", `${routes.resources}/new`, "resources.create"],
  ["Add notable alumnus", `${routes.alumni}/new`, "alumni.create"],
  ["Add “Did you know?” fact", `${routes.facts}/new`, "facts.create"],
  ["Edit school info", routes.school, "school.update"],
];

function QuickActions({ me }: { me: CurrentUser }) {
  const actions = QUICK.filter(([, , p]) => hasPermission(me, p));
  if (!actions.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>Common tasks</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map(([label, href]) => (
          <Button key={href} asChild variant="outline" className="justify-start">
            <Link href={href}>
              <PlusIcon /> {label}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

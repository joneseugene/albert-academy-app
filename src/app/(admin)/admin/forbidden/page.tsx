import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Access denied" };

export default function ForbiddenPage() {
  return (
    <div className="mx-auto grid max-w-md gap-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Access denied</h1>
      <p className="text-muted-foreground">
        You don&apos;t have permission to view that page. Ask a Super Admin if you need access.
      </p>
      <Button asChild variant="outline" className="justify-self-center">
        <Link href={routes.home}>Back to dashboard</Link>
      </Button>
    </div>
  );
}

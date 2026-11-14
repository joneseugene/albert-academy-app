import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-md gap-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Not found</h1>
      <p className="text-muted-foreground">That record doesn&apos;t exist or has been deleted.</p>
      <Button asChild variant="outline" className="justify-self-center">
        <Link href={routes.home}>Back to dashboard</Link>
      </Button>
    </div>
  );
}

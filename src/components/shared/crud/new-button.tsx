"use client";

import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Permission } from "@/config/permissions";
import { Can } from "@/providers/session-provider";

/** "Add …" toolbar button, shown only to users who may create. */
export function NewButton({
  href,
  label,
  permission,
}: {
  href: string;
  label: string;
  permission: Permission;
}) {
  return (
    <Can permission={permission}>
      <Button asChild>
        <Link href={href}>
          <PlusIcon /> {label}
        </Link>
      </Button>
    </Can>
  );
}

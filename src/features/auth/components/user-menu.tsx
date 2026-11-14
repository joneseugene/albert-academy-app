"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRoundIcon, LogOutIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";

import { UserAvatar } from "@/components/shared/user-avatar";
import { BladeSpinner } from "@/components/ui/blade-spinner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { routes } from "@/config/routes";
import { useCurrentUser } from "@/providers/session-provider";

export function UserMenu() {
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  // Stays true until the sign-in page has replaced this one.
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      // A plain request (not a server action), so the admin shell isn't
      // re-rendered and this menu stays on screen with its spinner.
      const res = await fetch("/api/auth/sign-out", { method: "POST" });
      if (!res.ok) throw new Error(String(res.status));
      // Full page change: nothing from the signed-in session lingers in memory.
      window.location.replace(routes.login);
    } catch {
      setSigningOut(false);
      toast.error("Couldn't sign out. Check your connection and try again.");
    }
  }

  return (
    // While signing out the menu can't be closed, so the spinner stays visible.
    <DropdownMenu open={open} onOpenChange={(next) => setOpen(signingOut ? true : next)}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full p-0 font-semibold"
          aria-label="Account menu"
        >
          <UserAvatar
            firstName={user.firstName}
            lastName={user.lastName}
            avatarUrl={user.avatarUrl}
            className="size-full bg-transparent text-foreground"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="grid gap-0.5">
          <span className="truncate">{user.fullName}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
          <span className="truncate text-xs font-normal text-primary">
            {user.role ?? "No role"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={routes.profile}>
            <UserIcon /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={routes.changePassword}>
            <KeyRoundIcon /> Change password
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          aria-disabled={signingOut}
          onSelect={(event) => {
            event.preventDefault(); // keep the menu open
            if (signingOut) return;
            void signOut();
          }}
        >
          <LogOutIcon /> {signingOut ? "Signing out…" : "Sign out"}
          {signingOut && <BladeSpinner className="ml-auto" label="Signing out" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

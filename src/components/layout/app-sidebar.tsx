"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo, LogoMark } from "@/components/brand/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { navigationFor } from "@/config/navigation";
import { routes } from "@/config/routes";
import { useCurrentUser } from "@/providers/session-provider";

function isActive(pathname: string, href: string) {
  return href === routes.home
    ? pathname === routes.home
    : pathname === href || pathname.startsWith(`${href}/`);
}

/** Permission-filtered navigation for the signed-in user. */
export function AppSidebar() {
  const user = useCurrentUser();
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const groups = navigationFor(user);

  // Close the mobile drawer after navigating.
  const onNavigate = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border">
        <Link
          href={routes.home}
          onClick={onNavigate}
          aria-label="Albert Academy home"
          className="flex items-center rounded-md px-1.5 outline-hidden group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <Logo className="group-data-[collapsible=icon]:hidden" />
          <LogoMark className="hidden group-data-[collapsible=icon]:block" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={`${group.label}-${item.href}`}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(pathname, item.href)}
                      tooltip={item.title}
                    >
                      <Link href={item.href} onClick={onNavigate}>
                        <item.icon aria-hidden />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

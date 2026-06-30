"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/_features/auth/server/actions";
import { HomeIcon, UserIcon, ShieldIcon, LogOutIcon, RocketIcon } from "lucide-react";

type AppSidebarProps = {
  userRole: string;
};

const navItems = [
  { href: "/app/feed", label: "Feed", icon: HomeIcon, adminOnly: false },
  { href: "/app/profile", label: "Profile", icon: UserIcon, adminOnly: false },
  { href: "/app/admin", label: "Admin", icon: ShieldIcon, adminOnly: true },
];

export function AppSidebar({ userRole }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = userRole === "admin" || userRole === "superadmin";

  const handleSignOut = async () => {
    await signOutAction();
    router.push("/login");
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/app/feed">
                <RocketIcon className="size-5 text-primary" />
                <span className="font-semibold">next-saas</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navItems
                .filter((item) => !item.adminOnly || isAdmin)
                .map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.href)}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="gap-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Sign Out" onClick={handleSignOut}>
              <button type="button" className="w-full">
                <LogOutIcon />
                <span>Sign Out</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

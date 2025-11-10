"use client";

import * as React from "react";
import {
  IconClipboard,
  IconHome2,
  IconKey,
  IconSettings,
  IconFileAnalytics,
  IconList,
} from "@tabler/icons-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
}

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconHome2,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: IconFileAnalytics,
    },
    {
      title: "Custom List",
      url: "/custom-list",
      icon: IconList,
    },
    {
      title: "API Key",
      url: "/api-key",
      icon: IconKey,
    },
    // {
    //   title: "Custom Lists",
    //   url: "/list",
    //   icon: IconList,
    // },
    // {
    //   title: "Documentation",
    //   url: "/documentation",
    //   icon: IconClipboard,
    // },
    // {
    //   title: "Settings",
    //   url: "/settings",
    //   icon: IconSettings,
    // },
  ],
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard" className="flex items-center gap-2">
                <span className="text-base font-semibold">Security Saas</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name || "Guest",
            email: user?.email || "No email",
            avatar: user?.avatar || "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}

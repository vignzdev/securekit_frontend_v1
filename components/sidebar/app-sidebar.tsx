"use client";

import * as React from "react";
import {
  IconClipboard,
  IconHome2,
  IconKey,
  IconSettings,
  IconFileAnalytics,
  IconList,
  IconCreditCard,
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
import { UserProfile } from "@/lib/auth";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: UserProfile | null;
}

// Define all possible menu items with their feature requirements
const allMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconHome2,
    requiredFeature: null, // Always visible
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: IconFileAnalytics,
    requiredFeature: "analytics", // Requires analytics === "full"
  },
  {
    title: "Custom List",
    url: "/custom-list",
    icon: IconList,
    requiredFeature: "customLists", // Requires customLists === true
  },
  {
    title: "API Key",
    url: "/api-key",
    icon: IconKey,
    requiredFeature: null, // Always visible
  },
  {
    title: "Plans",
    url: "/subscription",
    icon: IconCreditCard,
    requiredFeature: null, // Always visible
  },
];

// Function to filter menu items based on user's plan features
const getFilteredMenuItems = (user: UserProfile | null | undefined) => {
  if (!user?.subscription?.plan?.features) {
    // If no subscription, show only items that don't require features
    return allMenuItems.filter((item) => item.requiredFeature === null);
  }

  const features = user.subscription.plan.features;

  return allMenuItems.filter((item) => {
    if (item.requiredFeature === null) {
      return true; // Always show items with no feature requirement
    }

    switch (item.requiredFeature) {
      case "analytics":
        return features.analytics === "full";
      case "customLists":
        return features.customLists === true;
      default:
        return false;
    }
  });
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const filteredMenuItems = React.useMemo(() => {
    return getFilteredMenuItems(user).map(
      ({ requiredFeature, ...item }) => item
    );
  }, [user]);

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
                <span className="text-xl font-bold">securekit</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredMenuItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name || "Guest",
            email: user?.email || "No email",
            avatar: user?.profile_image || "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}

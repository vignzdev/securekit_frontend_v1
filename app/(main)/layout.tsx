"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, UserProfile } from "@/lib/auth";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserContext } from "@/context/UserContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { authenticated, user } = await isAuthenticated();
      if (!authenticated) {
        router.replace("/login");
      } else {
        setUser(user);
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, [router]);

  if (!authChecked) return null;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />
      <div
        className="flex flex-1 flex-col"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <UserContext.Provider
              value={{ user, setUser, authChecked, setAuthChecked }}
            >
              {children}
            </UserContext.Provider>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

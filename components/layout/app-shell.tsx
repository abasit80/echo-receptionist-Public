"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { TopBar } from "@/components/layout/top-bar";
import { DashboardIndustryBar } from "@/components/layout/dashboard-industry-bar";
import { IndustryProvider } from "@/components/layout/industry-context";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { MovingSquares } from "@/components/effects/moving-squares";
import type { AuthSession } from "@/lib/auth/session-core";

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: AuthSession | null;
}) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <IndustryProvider>
          <div className="relative min-h-screen bg-background text-foreground">
            <div className="relative z-[80]">
              <TopBar />
            </div>
            <Sidebar user={user} />
            <DashboardIndustryBar />
            <main className="relative px-3 py-3 pb-20 lg:px-4 lg:pb-4">
              <MovingSquares />
              <div className="relative">{children}</div>
            </main>
            <MobileNav />
          </div>
        </IndustryProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

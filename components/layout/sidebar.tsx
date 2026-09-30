"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Headset,
  LayoutDashboard,
  Settings2,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";
import type { AuthSession } from "@/lib/auth/session-core";

const nav = [
  { href: "/dashboard", label: "Mission Control", hint: "Live KPIs", icon: LayoutDashboard },
  { href: "/calls", label: "Call Logs", hint: "Voice inbox", icon: Headset },
  { href: "/pipeline", label: "Lead Pipeline", hint: "CRM stages", icon: Workflow },
  { href: "/agent", label: "AI Agent Builder", hint: "Playbook", icon: Sparkles },
  { href: "/integrations", label: "Integrations", hint: "Calendar · GHL", icon: CalendarDays },
  { href: "/settings/vapi", label: "Vapi Configuration", hint: "Voice engine", icon: Settings2 },
];

export function Sidebar({ user }: { user?: AuthSession | null }) {
  const pathname = usePathname();
  const { mode, setMode } = useSidebar();
  const { theme } = useTheme();
  const open = mode !== "hidden";
  const light = theme === "light";

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-x-0 bottom-0 top-14 z-40 cursor-default bg-black/10"
        aria-label="Close menu"
        onMouseDown={(event) => {
          event.preventDefault();
          setMode("hidden");
        }}
      />
      <aside
        className={cn(
          "fixed left-3 top-16 z-50 flex max-h-[calc(100vh-5.5rem)] w-72 flex-col overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl",
          light
            ? "border-white/60 bg-white/55 text-slate-900"
            : "border-white/15 bg-forest/75 text-white"
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-3">
          <BrandLogo href="/dashboard" inverted={!light} size="sm" subtitle="AI Voice OS" />
          <button
            type="button"
            onClick={() => setMode("hidden")}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              light ? "hover:bg-white/70" : "hover:bg-white/10"
            )}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-2">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMode("hidden")}
                className={cn(
                  "relative flex items-center gap-3 overflow-hidden rounded-xl px-2.5 py-2 text-sm",
                  active
                    ? "text-white"
                    : light
                      ? "text-slate-700 hover:bg-white/70"
                      : "text-slate-200 hover:bg-white/10"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400"
                  />
                )}
                <span
                  className={cn(
                    "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    active ? "bg-white/15" : light ? "bg-white/80" : "bg-white/10"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="relative min-w-0">
                  <span className="block truncate font-medium">{item.label}</span>
                  <span className={cn("block truncate text-[11px]", active ? "text-white/75" : "text-slate-500")}>
                    {item.hint}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <p className={cn("truncate text-sm font-medium", light ? "text-slate-900" : "text-white")}>
            {user?.name ?? "Echo user"}
          </p>
          <p className={cn("truncate text-xs", light ? "text-slate-500" : "text-slate-400")}>{user?.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <ThemeToggle
              className={
                light
                  ? "h-8 w-8 border-white/70 bg-white/70"
                  : "h-8 w-8 border-white/15 bg-white/5 text-white"
              }
            />
            <LogoutButton light={light} />
          </div>
        </div>
      </aside>
    </>
  );
}

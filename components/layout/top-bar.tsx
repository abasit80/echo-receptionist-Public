"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { EchoCore3D } from "@/components/effects/echo-core-3d";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

export function TopBar({ title }: { title?: string }) {
  const { mode, toggleHidden } = useSidebar();
  const { theme } = useTheme();
  const light = theme === "light";

  return (
    <div
      className={cn(
        "sticky top-0 z-[60] flex items-center justify-between gap-3 border-b px-3 py-2.5 backdrop-blur-xl lg:px-4",
        light ? "border-slate-200/80 bg-white/80" : "border-white/10 bg-forest/80"
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            "relative z-[90] h-9 w-9",
            light
              ? "border-slate-200 bg-white/70 text-slate-800 hover:bg-white"
              : "border-white/20 bg-white/5 text-white hover:bg-white/10"
          )}
          onClick={(event) => {
            event.stopPropagation();
            toggleHidden();
          }}
          aria-label={mode === "hidden" ? "Open menu" : "Close menu"}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <EchoCore3D compact className="h-9 w-9" />
          <span>
            <span
              className={cn(
                "block text-sm font-semibold leading-tight",
                light ? "text-slate-900" : "text-white"
              )}
            >
              {title ?? "EchoReceptionist"}
            </span>
            <span className={cn("hidden text-[10px] uppercase tracking-[0.16em] sm:block", light ? "text-forest-700" : "text-gold-400")}>
              AI Voice OS
            </span>
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle
          className={
            light
              ? "border-slate-200 bg-white/70 text-slate-800 hover:bg-white"
              : "border-white/15 bg-white/5 text-white hover:bg-white/10"
          }
        />
        <LogoutButton light={light} />
      </div>
    </div>
  );
}

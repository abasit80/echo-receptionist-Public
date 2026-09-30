"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioLines, Headset, LayoutDashboard, LogOut, Sparkles, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/calls", label: "Calls", icon: Headset },
  { href: "/pipeline", label: "Pipeline", icon: Workflow },
  { href: "/agent", label: "Agent", icon: Sparkles },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-400 bg-slate-200 px-2 py-2 backdrop-blur dark:border-border dark:bg-background/95 lg:hidden">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[11px]",
                active ? "text-gold-700 dark:text-gold-400" : "text-slate-800 dark:text-slate-300"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <Link href="/settings/vapi" className="flex flex-col items-center gap-1 text-[11px] text-slate-800">
          <AudioLines className="h-4 w-4" />
          Vapi
        </Link>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="flex flex-col items-center gap-1 text-[11px] text-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Out
          </button>
        </form>
      </div>
    </nav>
  );
}

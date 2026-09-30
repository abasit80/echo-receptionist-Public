"use client";

import { motion } from "framer-motion";
import { industries } from "@/components/landing/industry-taskbar";
import { useIndustry } from "@/components/layout/industry-context";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

export function DashboardIndustryBar() {
  const { industry, setIndustry } = useIndustry();
  const { theme } = useTheme();
  const light = theme === "light";
  const current = industries.find((item) => item.id === industry) ?? industries[0];

  return (
    <div
      className={cn(
        "relative border-b",
        light ? "border-slate-200 bg-white/80" : "border-white/10 bg-forest/85"
      )}
    >
      <div className="relative px-3 py-2.5 lg:px-4">
        <div className="mb-2 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p
              className={cn(
                "text-[10px] font-semibold uppercase tracking-[0.18em]",
                light ? "text-gold-700" : "text-gold-400"
              )}
            >
              Industry playbook
            </p>
            <p className={cn("truncate text-sm font-semibold", light ? "text-slate-900" : "text-white")}>
              {current.headline}
            </p>
          </div>
          <p className={cn("hidden min-w-0 flex-1 truncate text-right text-xs sm:block", light ? "text-slate-500" : "text-slate-400")}>
            {current.blurb}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {industries.map((item) => {
            const Icon = item.icon;
            const selected = item.id === industry;
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => setIndustry(item.id)}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative min-w-0 overflow-hidden rounded-xl border px-3 py-2.5 text-left transition",
                  selected
                    ? "border-gold-400/50 text-forest-900 shadow-[0_8px_20px_rgba(212,160,23,0.22)]"
                    : light
                      ? "border-slate-200 bg-white text-slate-700 hover:border-gold-500"
                      : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20"
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="industry-active"
                    className="absolute inset-0 bg-gradient-to-br from-gold-600 via-gold-500 to-gold-400"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}
                <span className="relative flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                        selected
                          ? "border-white/25 bg-white/15"
                          : light
                            ? "border-slate-200 bg-slate-50"
                            : "border-white/10 bg-white/5"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{item.label}</span>
                      <span className={cn("block text-[11px]", selected ? "text-white/75" : "text-slate-500")}>
                        {item.tasks.length} live tasks
                      </span>
                    </span>
                  </span>
                  {selected && (
                    <span className="shrink-0 rounded-full bg-forest/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-forest-900">
                      Live
                    </span>
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

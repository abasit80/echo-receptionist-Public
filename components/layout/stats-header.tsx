"use client";

import { motion } from "framer-motion";
import { CalendarCheck2, PhoneCall, ShieldCheck, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CallWaveform } from "@/components/dashboard/call-waveform";
import type { DashboardStats } from "@/lib/types";

const cards = [
  { key: "activeCalls", label: "Active calls", icon: PhoneCall, accent: true, target: "live" as const },
  { key: "callsToday", label: "Calls today", icon: PhoneCall, accent: false, target: "calls" as const },
  { key: "qualifiedLeads", label: "Qualified leads", icon: Users, accent: false, target: "qualified" as const },
  { key: "bookedAppointments", label: "Booked today", icon: CalendarCheck2, accent: false, target: "booked" as const },
] as const;

export function StatsHeader({
  stats,
  onFocus,
  action,
}: {
  stats: DashboardStats;
  onFocus?: (target: "live" | "calls" | "qualified" | "booked" | "sentiment" | "crm") => void;
  action?: React.ReactNode;
}) {
  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
            Mission Control
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Voice operations at a glance
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {action}
          <button
            type="button"
            onClick={() => onFocus?.("live")}
            className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2 text-left shadow-sm transition hover:border-success-500/40"
          >
            <CallWaveform active={stats.activeCalls > 0} />
            <div>
              <p className="text-xs text-muted-foreground">Live line</p>
              <p className="text-sm font-medium text-gold-600">
                {stats.activeCalls} call{stats.activeCalls === 1 ? "" : "s"} in progress
              </p>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const value = stats[card.key];
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <button type="button" className="h-full w-full text-left" onClick={() => onFocus?.(card.target)}>
                <Card className="h-full p-3 transition hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-muted-foreground">
                        {card.label}
                      </p>
                      <motion.p
                        key={value}
                        initial={{ y: 6, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mt-1 text-2xl font-semibold"
                      >
                        {value}
                      </motion.p>
                    </div>
                    <div
                      className={
                        "rounded-lg p-2 " +
                        (card.accent ? "bg-success-100 text-success-800" : "bg-gold-400/20 text-gold-700")
                      }
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </Card>
              </button>
            </motion.div>
          );
        })}
        <button type="button" className="h-full text-left" onClick={() => onFocus?.("sentiment")}>
          <Card className="flex h-full items-center justify-between p-3 transition hover:shadow-md">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Sentiment</p>
              <p className="mt-1 text-2xl font-semibold">{stats.avgSentimentScore}/100</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-gold-600" />
          </Card>
        </button>
        <button type="button" className="h-full text-left" onClick={() => onFocus?.("crm")}>
          <Card className="flex h-full flex-col justify-between p-3 transition hover:shadow-md">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">CRM sync</p>
            <p className="mt-1 text-2xl font-semibold">{stats.crmSyncRate}%</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-success-500" style={{ width: `${stats.crmSyncRate}%` }} />
            </div>
          </Card>
        </button>
      </div>
    </header>
  );
}

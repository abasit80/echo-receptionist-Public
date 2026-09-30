"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  CalendarCheck2,
  House,
  MessageSquareText,
  PhoneForwarded,
  Scale,
  Sparkles,
  Stethoscope,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const industries = [
  {
    id: "home",
    label: "Home Services",
    icon: Wrench,
    headline: "After-hours jobs, booked before sunrise",
    blurb: "Echo triages P1 no-heat, books a $189 diagnostic on Google Calendar, and texts the Carrier estimate.",
    tasks: [
      { action: "dispatch", icon: PhoneForwarded, title: "Emergency dispatch", detail: "P1 no-heat / burst pipe — transfer to Hale HVAC dispatch, ZIP 94107." },
      { action: "book", icon: CalendarCheck2, title: "Job booking", detail: "Hold the next live Google Calendar crew window ($189 diagnostic)." },
      { action: "followup", icon: MessageSquareText, title: "Quote follow-up", detail: "Twilio SMS: Carrier 96% AFUE $8,400–$11,200." },
      { action: "check", icon: House, title: "Service area check", detail: "Coverage map: 94103, 94107, 94110 — not 94121." },
    ],
  },
  {
    id: "dental",
    label: "Dental",
    icon: Stethoscope,
    headline: "Same-day consults without a full-time front desk",
    blurb: "Echo answers Delta Dental PPO vs Medicaid, books hygiene on Google Calendar, and flags pain for transfer.",
    tasks: [
      { action: "book", icon: CalendarCheck2, title: "Hygiene & consults", detail: "45-min new-patient exam on the live Google Calendar." },
      { action: "followup", icon: MessageSquareText, title: "Insurance FAQ", detail: "Delta Dental PPO yes. Medicaid / Medicare no. Cash-pay SMS." },
      { action: "dispatch", icon: PhoneForwarded, title: "Pain / urgent transfer", detail: "Swelling / cracked tooth — on-call dentist, GHL Urgent." },
      { action: "check", icon: Stethoscope, title: "New patient intake", detail: "Name, callback, AM window — no invented chair time." },
    ],
  },
  {
    id: "medspa",
    label: "Medspa",
    icon: Sparkles,
    headline: "Fill the chair, not the voicemail box",
    blurb: "Echo books a 45-min Botox consult on Google Calendar, texts HydraFacial prep, and transfers VIPs.",
    tasks: [
      { action: "book", icon: CalendarCheck2, title: "Consult booking", detail: "Hold the next live 45-min neuromodulator consult." },
      { action: "check", icon: Sparkles, title: "Treatment menu", detail: "HydraFacial, peel, Botox consult — no invented prices." },
      { action: "followup", icon: MessageSquareText, title: "Reminder texts", detail: "Twilio: no alcohol / ibuprofen 24h before Botox." },
      { action: "dispatch", icon: PhoneForwarded, title: "VIP transfer", detail: "Returning HydraFacial client → coordinator, GHL VIP." },
    ],
  },
  {
    id: "legal",
    label: "Legal",
    icon: Scale,
    headline: "Qualify intake before a lawyer picks up",
    blurb: "Echo screens PI vs custody, books a 30-min consult, and writes the intake into GoHighLevel.",
    tasks: [
      { action: "check", icon: Scale, title: "Matter screening", detail: "Custody → family docket. Not PI, not business." },
      { action: "book", icon: CalendarCheck2, title: "Consult calendar", detail: "30-min hold on the live attorney Google Calendar." },
      { action: "dispatch", icon: PhoneForwarded, title: "Human handoff", detail: "I-90 MVA — conflict-clear, warm-transfer to counsel." },
      { action: "followup", icon: MessageSquareText, title: "Intake summary", detail: "GoHighLevel: matter type, callback, sentiment." },
    ],
  },
  {
    id: "realty",
    label: "Real Estate",
    icon: Building2,
    headline: "Catch buyer intent the first time they call",
    blurb: "Echo matches 420 Market Street Suite 300, books a 20-min tour, and transfers hot buyers.",
    tasks: [
      { action: "check", icon: Building2, title: "Listing lookup", detail: "420 Market St, Suite 300 — active, not sold." },
      { action: "book", icon: CalendarCheck2, title: "Showing slots", detail: "Hold a 20-min tour on the agent Google Calendar." },
      { action: "followup", icon: MessageSquareText, title: "Buyer SMS", detail: "Twilio: listing URL + parking notes." },
      { action: "dispatch", icon: PhoneForwarded, title: "Agent transfer", detail: "Hot buyer for 420 Market — live agent + desk SMS." },
    ],
  },
];

export function IndustryTaskbar({
  compact = false,
  cinematic = false,
  value,
  onChange,
}: {
  compact?: boolean;
  cinematic?: boolean;
  value?: string;
  onChange?: (id: string) => void;
}) {
  const [internal, setInternal] = useState(industries[0].id);
  const active = value ?? internal;
  const setActive = onChange ?? setInternal;
  const current = industries.find((item) => item.id === active) ?? industries[0];

  return (
    <div className={cn(!compact && "space-y-6")}>
      <div
        className={cn(
          "flex gap-2 overflow-x-auto pb-1",
          compact
            ? "px-0"
            : cinematic
              ? "rounded-xl border border-white/10 bg-white/5 p-2"
              : "rounded-xl border border-slate-300 bg-slate-100 p-2"
        )}
      >
        {industries.map((item) => {
          const Icon = item.icon;
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all",
                selected
                  ? cinematic
                    ? "bg-gradient-to-r from-gold-600 to-gold-400 text-forest-900 shadow-md shadow-gold/20"
                    : "bg-gold-600 text-forest-900 shadow-md shadow-gold/20"
                  : cinematic
                    ? "bg-white/10 text-slate-200 hover:bg-white/20"
                    : "bg-slate-200/80 text-slate-800 hover:bg-slate-300 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/10"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {!compact && (
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={cn(
              "rounded-xl border p-6",
              cinematic
                ? "border-white/10 bg-black/25"
                : "border-slate-300 bg-slate-50 dark:border-white/10 dark:bg-card"
            )}
          >
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-[0.16em]",
                cinematic ? "text-gold-400" : "text-gold-700"
              )}
            >
              {current.label} tasks
            </p>
            <h3 className={cn("mt-2 text-2xl font-bold", cinematic ? "text-white" : "text-foreground")}>
              {current.headline}
            </h3>
            <p className={cn("mt-2 max-w-2xl text-sm", cinematic ? "text-slate-300" : "text-muted-foreground")}>
              {current.blurb}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {current.tasks.map((task) => {
                const inner = (
                  <>
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        cinematic ? "bg-gold-400/15 text-gold-400" : "bg-gold-400/20 text-gold-700"
                      )}
                    >
                      <task.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={cn("text-sm font-semibold", cinematic && "text-white")}>{task.title}</p>
                      <p
                        className={cn(
                          "mt-1 text-xs leading-relaxed",
                          cinematic ? "text-slate-300" : "text-slate-500"
                        )}
                      >
                        {task.detail}
                      </p>
                    </div>
                  </>
                );
                return cinematic ? (
                  <Link
                    key={task.title}
                    href={`/dashboard?industry=${current.id}`}
                    className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-gold-400/40"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={task.title} className="flex gap-3 rounded-xl border bg-muted/50 p-4">
                    {inner}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

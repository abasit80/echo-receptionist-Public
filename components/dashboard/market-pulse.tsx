"use client";

import { useEffect, useState } from "react";
import { MARKET } from "@/lib/data/market";
import { cn } from "@/lib/utils";

const facts: Record<string, { label: string; value: string }[]> = {
  home: [
    { label: "Coverage", value: `${MARKET.home.zips.join(" · ")}` },
    { label: "Out of area", value: MARKET.home.outOfArea.join(", ") },
    { label: "Diagnostic", value: `$${MARKET.home.diagnosticFee}` },
    { label: "Quote", value: MARKET.home.quoteRange },
  ],
  dental: [
    { label: "Accepts", value: MARKET.dental.accepted.join(", ") },
    { label: "Does not", value: MARKET.dental.declined.join(" / ") },
    { label: "New patient", value: `${MARKET.dental.newPatientMinutes} min exam` },
    { label: "CRM", value: MARKET.dental.ghlPipeline },
  ],
  medspa: [
    { label: "Menu", value: MARKET.medspa.menu.join(" · ") },
    { label: "Consult", value: `${MARKET.medspa.consultMinutes} min` },
    { label: "Prep", value: "No alcohol / ibuprofen 24h" },
    { label: "CRM", value: MARKET.medspa.ghlPipeline },
  ],
  legal: [
    { label: "Matters", value: MARKET.legal.matters.join(" · ") },
    { label: "Consult", value: `${MARKET.legal.consultMinutes} min` },
    { label: "CRM", value: MARKET.legal.ghlPipeline },
    { label: "Screen", value: "Conflict check before book" },
  ],
  realty: [
    { label: "Listing", value: "420 Market St, Ste 300" },
    { label: "Status", value: MARKET.realty.listingStatus },
    { label: "Tour", value: `${MARKET.realty.tourMinutes} min` },
    { label: "CRM", value: MARKET.realty.ghlPipeline },
  ],
};

export function MarketPulse({
  cinematic = false,
  industry = "home",
}: {
  cinematic?: boolean;
  industry?: string;
}) {
  const [nextSlot, setNextSlot] = useState<string>("Loading calendar…");
  const [provider, setProvider] = useState("Google Calendar");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const response = await fetch("/api/market", { cache: "no-store" });
      if (!response.ok || cancelled) return;
      const data = await response.json();
      const label = data.calendar?.slots?.[0]?.label as string | undefined;
      setNextSlot(label ? `${label} PT` : "No weekday holds left");
      setProvider(data.calendar?.provider === "google_calendar" ? "Google Calendar" : "Google Calendar (live board)");
    }
    void load();
    const id = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const rows = facts[industry] ?? facts.home;

  return (
    <div
      className={cn(
        "grid gap-2 rounded-xl border p-3 sm:grid-cols-2 lg:grid-cols-5",
        cinematic ? "border-white/10 bg-black/25" : "border-border bg-card"
      )}
    >
      <div className={cn("rounded-lg px-3 py-2", cinematic ? "bg-white/5" : "bg-muted/50")}>
        <p className={cn("text-[10px] font-semibold uppercase tracking-[0.14em]", cinematic ? "text-gold-400" : "text-gold-700")}>
          Next hold · {provider}
        </p>
        <p className={cn("mt-1 text-sm font-semibold", cinematic ? "text-white" : "text-foreground")}>{nextSlot}</p>
      </div>
      {rows.map((row) => (
        <div key={row.label} className={cn("rounded-lg px-3 py-2", cinematic ? "bg-white/5" : "bg-muted/50")}>
          <p className={cn("text-[10px] font-semibold uppercase tracking-[0.14em]", cinematic ? "text-slate-400" : "text-muted-foreground")}>
            {row.label}
          </p>
          <p className={cn("mt-1 text-sm font-medium", cinematic ? "text-slate-100" : "text-foreground")}>{row.value}</p>
        </div>
      ))}
    </div>
  );
}

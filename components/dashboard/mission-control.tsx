"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneIncoming } from "lucide-react";
import { CallLog } from "@/components/dashboard/call-log";
import { DashboardPlaybook } from "@/components/dashboard/dashboard-playbook";
import { MarketPulse } from "@/components/dashboard/market-pulse";
import { LeadPipeline } from "@/components/dashboard/lead-pipeline";
import { StatsHeader } from "@/components/layout/stats-header";
import { Button } from "@/components/ui/button";
import { useIndustry } from "@/components/layout/industry-context";
import { computeStats, filterByIndustry } from "@/lib/data/stats";
import type { CallRecord, DashboardStats, Lead } from "@/lib/types";

export function MissionControl({
  calls: initialCalls,
  leads: initialLeads,
}: {
  calls: CallRecord[];
  leads: Lead[];
  stats: DashboardStats;
}) {
  const router = useRouter();
  const { industry } = useIndustry();
  const [calls, setCalls] = useState(initialCalls);
  const [leads, setLeads] = useState(initialLeads);
  const [busy, setBusy] = useState(false);
  const [focus, setFocus] = useState<"all" | "live" | "calls" | "qualified" | "booked" | "sentiment" | "crm">("all");

  async function refresh() {
    const response = await fetch("/api/dashboard", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    setCalls(data.calls);
    setLeads(data.leads);
  }

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      if (cancelled) return;
      await refresh();
    }
    poll();
    const id = window.setInterval(poll, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const visibleCalls = useMemo(
    () => filterByIndustry(calls, industry),
    [calls, industry]
  );
  const visibleLeads = useMemo(
    () => filterByIndustry(leads, industry),
    [leads, industry]
  );
  const stats = useMemo(
    () => computeStats(visibleCalls, visibleLeads),
    [visibleCalls, visibleLeads]
  );

  const focusedCalls = useMemo(() => {
    if (focus === "live") return visibleCalls.filter((call) => call.status === "in_progress");
    if (focus === "crm") return visibleCalls.filter((call) => call.crm_status !== "synced");
    if (focus === "sentiment") {
      return [...visibleCalls].sort((a, b) => Number(Boolean(b.sentiment)) - Number(Boolean(a.sentiment)));
    }
    return visibleCalls;
  }, [visibleCalls, focus]);

  const focusedLeads = useMemo(() => {
    if (focus === "qualified") {
      return visibleLeads.filter((lead) => ["qualified", "booked"].includes(lead.stage));
    }
    if (focus === "booked") return visibleLeads.filter((lead) => lead.stage === "booked");
    return visibleLeads;
  }, [visibleLeads, focus]);

  async function simulateInbound() {
    setBusy(true);
    await fetch("/api/calls/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ industry }),
    });
    await refresh();
    setFocus("live");
    setBusy(false);
  }

  function onFocus(target: "live" | "calls" | "qualified" | "booked" | "sentiment" | "crm") {
    if (target === "calls") {
      router.push("/calls");
      return;
    }
    if (target === "qualified" || target === "booked") {
      setFocus(target);
      document.getElementById("pipeline")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setFocus(target);
    document.getElementById("call-log")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="space-y-4">
      <StatsHeader
        stats={stats}
        onFocus={onFocus}
        action={
          <Button onClick={simulateInbound} disabled={busy} size="sm">
            <PhoneIncoming className="h-4 w-4" />
            {busy ? "Connecting…" : "Simulate inbound"}
          </Button>
        }
      />
      <DashboardPlaybook onRan={() => void refresh()} />
      <MarketPulse industry={industry} />
      {focus !== "all" && (
        <div className="flex items-center justify-between rounded-xl border bg-gold-400/10 px-4 py-2 text-sm dark:bg-gold-500/10">
          <p>
            Filtered to{" "}
            <span className="font-medium">
              {focus === "live"
                ? "active calls"
                : focus === "crm"
                  ? "CRM issues"
                  : focus === "sentiment"
                    ? "sentiment"
                    : focus === "qualified"
                      ? "qualified leads"
                      : "booked leads"}
            </span>
          </p>
          <button type="button" className="text-gold-600 hover:underline" onClick={() => setFocus("all")}>
            Clear
          </button>
        </div>
      )}
      <div id="call-log">
        <CallLog calls={focusedCalls.slice(0, 8)} compact />
      </div>
      <section id="pipeline" className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Lead pipeline</h2>
          <p className="text-sm text-muted-foreground">
            Leads qualified by Echo and staged for booking or handoff.
            {focus === "booked" ? " Showing booked leads." : focus === "qualified" ? " Showing qualified leads." : ""}
          </p>
        </div>
        <LeadPipeline leads={focusedLeads} controlled />
      </section>
    </div>
  );
}

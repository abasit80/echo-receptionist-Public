"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, PhoneIncoming, RefreshCw, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SentimentIndicator } from "@/components/dashboard/sentiment-indicator";
import { CallWaveform } from "@/components/dashboard/call-waveform";
import { formatDuration, formatPhone } from "@/lib/utils";
import type { CallRecord, CallStatus, CrmStatus } from "@/lib/types";

const statusVariant: Record<CallStatus, "success" | "info" | "warning" | "muted" | "danger"> = {
  completed: "success",
  scheduled: "info",
  transferred: "warning",
  in_progress: "success",
  missed: "danger",
};

const crmVariant: Record<CrmStatus, "success" | "warning" | "danger"> = {
  synced: "success",
  pending: "warning",
  failed: "danger",
};

const filters: Array<{ id: "all" | CallStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "in_progress", label: "In progress" },
  { id: "scheduled", label: "Scheduled" },
  { id: "completed", label: "Completed" },
  { id: "transferred", label: "Transferred" },
];

function liveDuration(startedAt: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
}

export function CallLog({
  calls: initialCalls,
  compact = false,
}: {
  calls: CallRecord[];
  compact?: boolean;
}) {
  const [calls, setCalls] = useState(initialCalls);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [selected, setSelected] = useState<CallRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!compact) return;
    setCalls(initialCalls);
    setSelected((current) =>
      current ? initialCalls.find((item) => item.id === current.id) ?? current : current
    );
  }, [compact, initialCalls]);

  useEffect(() => {
    const clock = window.setInterval(() => setTick((value) => value + 1), 1000);
    if (compact) {
      return () => window.clearInterval(clock);
    }

    let cancelled = false;
    async function refresh() {
      const response = await fetch("/api/calls", { cache: "no-store" });
      if (!response.ok || cancelled) return;
      const data = (await response.json()) as CallRecord[];
      setCalls(data);
      setSelected((current) =>
        current ? data.find((item) => item.id === current.id) ?? current : current
      );
    }
    refresh();
    const poll = window.setInterval(refresh, 3500);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.clearInterval(clock);
    };
  }, [compact]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return calls.filter((call) => {
      const matchesFilter = filter === "all" || call.status === filter;
      const haystack = `${call.caller_name} ${call.caller_phone} ${call.ai_summary ?? ""}`.toLowerCase();
      return matchesFilter && (!needle || haystack.includes(needle));
    });
  }, [calls, filter, query]);

  async function simulateInbound() {
    setBusy(true);
    await fetch("/api/calls/simulate", { method: "POST" });
    const response = await fetch("/api/calls", { cache: "no-store" });
    if (response.ok) setCalls(await response.json());
    setFilter("in_progress");
    setBusy(false);
  }

  async function retryCrm(id: string) {
    setSyncing(id);
    const response = await fetch(`/api/calls/${id}/sync`, { method: "POST" });
    const data = await response.json();
    if (data.call) {
      setCalls((current) => current.map((item) => (item.id === id ? data.call : item)));
      setSelected((current) => (current?.id === id ? data.call : current));
    }
    setSyncing(null);
  }

  return (
    <Card>
      <CardHeader className="gap-4 space-y-0 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Call log</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Live status, AI summaries, and CRM write-back.
          </p>
        </div>
        {!compact && (
          <Button onClick={simulateInbound} disabled={busy} size="sm">
            <PhoneIncoming className="h-4 w-4" />
            {busy ? "Connecting…" : "Simulate inbound"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!compact && (
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, phone, or summary"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filter === item.id
                      ? "bg-gold-600 text-forest-900"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 font-medium">Caller</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Sentiment</th>
                <th className="pb-3 font-medium">AI Summary</th>
                <th className="pb-3 font-medium">CRM Status</th>
                <th className="pb-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((call) => {
                const seconds =
                  call.status === "in_progress"
                    ? liveDuration(call.started_at)
                    : call.duration_seconds;
                return (
                  <tr
                    key={call.id}
                    onClick={() => setSelected(call)}
                    className="cursor-pointer border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-4 align-top">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-muted-foreground">
                          {call.direction === "inbound" ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{call.caller_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPhone(call.caller_phone)} · {formatDuration(seconds)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 align-top">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant[call.status]}>
                          {call.status.replace("_", " ")}
                        </Badge>
                        {call.status === "in_progress" && <CallWaveform />}
                      </div>
                    </td>
                    <td className="py-4 align-top">
                      <SentimentIndicator sentiment={call.sentiment} />
                    </td>
                    <td className="max-w-xs py-4 align-top text-muted-foreground">
                      {compact
                        ? `${(call.ai_summary ?? "Processing…").slice(0, 90)}${
                            (call.ai_summary?.length ?? 0) > 90 ? "…" : ""
                          }`
                        : call.ai_summary ?? "Processing transcript…"}
                    </td>
                    <td className="py-4 align-top">
                      <Badge variant={crmVariant[call.crm_status]}>{call.crm_status}</Badge>
                      {call.crm_contact_id && (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {call.crm_contact_id}
                        </p>
                      )}
                    </td>
                    <td className="py-4 align-top text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(call.started_at), { addSuffix: true })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!visible.length && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No calls match this filter.
            </p>
          )}
        </div>
      </CardContent>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.aside
              initial={{ x: 360 }}
              animate={{ x: 0 }}
              exit={{ x: 360 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(event) => event.stopPropagation()}
              className="h-full w-full max-w-md overflow-y-auto border-l bg-card p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Call detail</p>
                  <h3 className="mt-1 text-lg font-semibold">{selected.caller_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatPhone(selected.caller_phone)}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant={statusVariant[selected.status]}>
                  {selected.status.replace("_", " ")}
                </Badge>
                <Badge variant={crmVariant[selected.crm_status]}>{selected.crm_status}</Badge>
                {selected.tags.map((tag) => (
                  <Badge key={tag} variant="muted">
                    {tag}
                  </Badge>
                ))}
              </div>
              {selected.status === "in_progress" && (
                <div className="mt-4 rounded-xl border bg-success-50 p-3 dark:bg-success-700/10">
                  <CallWaveform />
                  <p className="mt-2 text-xs text-success-700">
                    Live · {formatDuration(liveDuration(selected.started_at))}
                  </p>
                </div>
              )}
              <div className="mt-6 space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">AI summary</p>
                  <p className="mt-1 leading-relaxed">{selected.ai_summary}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Transcript</p>
                  <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs leading-relaxed">
                    {selected.transcript ?? "Transcript will appear when the call ends."}
                  </pre>
                </div>
              </div>
              <Button
                className="mt-6 w-full"
                variant="outline"
                disabled={syncing === selected.id}
                onClick={() => retryCrm(selected.id)}
              >
                <RefreshCw className="h-4 w-4" />
                {syncing === selected.id ? "Syncing CRM…" : "Sync to CRM"}
              </Button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

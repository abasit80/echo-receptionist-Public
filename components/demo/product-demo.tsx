"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck2, PhoneIncoming } from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CallWaveform } from "@/components/dashboard/call-waveform";
import { SentimentIndicator } from "@/components/dashboard/sentiment-indicator";
import type { Sentiment } from "@/lib/types";

const transcript = [
  { who: "Echo", text: "Thanks for calling Northline Dental. This is Echo. How can I help today?" },
  { who: "Maya", text: "I need a same-day consult. My insurance was just denied." },
  { who: "Echo", text: "I can hear this is urgent. I have a 3:30 opening with Dr. Patel." },
  { who: "Maya", text: "Yes — book that, please." },
  { who: "Echo", text: "Booked. I’ll text a confirmation and update your CRM now." },
];

const logSeed = [
  {
    name: "James Ortega",
    status: "scheduled",
    sentiment: "positive" as Sentiment,
    summary: "Qualified. Tuesday 10:00 AM discovery call booked.",
    crm: "synced",
  },
  {
    name: "Priya Shah",
    status: "completed",
    sentiment: "positive" as Sentiment,
    summary: "Outbound follow-up. Requested premium pricing SMS.",
    crm: "synced",
  },
];

const pipelineStages = ["New", "Qualified", "Booked"] as const;

export function ProductDemo() {
  const [lineCount, setLineCount] = useState(0);
  const [stage, setStage] = useState(0);
  const [crm, setCrm] = useState<"pending" | "synced">("pending");
  const [sentiment, setSentiment] = useState<Sentiment>("urgent");
  const [callLive, setCallLive] = useState(true);
  const [stats, setStats] = useState({ calls: 11, leads: 6, booked: 3 });

  useEffect(() => {
    let cancelled = false;
    const ids: number[] = [];
    const later = (fn: () => void, ms: number) => {
      ids.push(window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms));
    };

    const reset = () => {
      setLineCount(0);
      setStage(0);
      setCrm("pending");
      setSentiment("urgent");
      setCallLive(true);
      setStats({ calls: 11, leads: 6, booked: 3 });
    };

    const play = () => {
      reset();
      later(() => setLineCount(1), 400);
      later(() => setLineCount(2), 1800);
      later(() => setLineCount(3), 3200);
      later(() => setStage(1), 3600);
      later(() => setLineCount(4), 4800);
      later(() => setLineCount(5), 6400);
      later(() => {
        setSentiment("positive");
        setStage(2);
        setCallLive(false);
        setCrm("synced");
        setStats({ calls: 12, leads: 7, booked: 4 });
      }, 7200);
      later(play, 12000);
    };

    play();
    return () => {
      cancelled = true;
      ids.forEach(clearTimeout);
    };
  }, []);

  const visibleLines = useMemo(() => transcript.slice(0, lineCount), [lineCount]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-forest">
      <div className="pointer-events-none absolute inset-0 aurora" />
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <BrandLogo size="sm" inverted />
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="text-white hover:bg-white/10">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-gold-600 to-gold-400 text-forest-900 hover:bg-gold-600">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
            Product demo
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Watch Echo take a <span className="shimmer-text">live call</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            A looping preview of Mission Control — voice, sentiment, booking, and CRM
            write-back — without signing in.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 rounded-3xl bg-gold-500/20 blur-2xl animate-glow-shift" />
          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-forest-800 shadow-panel">
          <div className="flex min-h-[640px]">
            <aside className="sidebar-surface relative hidden w-56 shrink-0 flex-col overflow-hidden p-5 text-white md:flex">
              <div className="pointer-events-none absolute -left-8 top-0 h-28 w-28 rounded-full bg-gold-400/20 blur-3xl" />
              <div className="relative flex items-center gap-2">
                <BrandLogo href={null} inverted iconOnly size="md" />
                <div>
                  <p className="text-sm font-semibold">Mission Control</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-gold-400/80">Live preview</p>
                </div>
              </div>
              <div className="relative mt-8 space-y-2 text-sm">
                {["Call Logs", "Lead Pipeline", "AI Agent", "Vapi Config"].map((item) => (
                  <div key={item} className="rounded-xl px-3 py-2.5 text-slate-400">
                    {item}
                  </div>
                ))}
                <div className="rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-3 py-2.5 font-medium text-forest-900 shadow-[0_8px_20px_rgba(212,160,23,0.25)]">
                  Live demo
                </div>
              </div>
            </aside>

            <div className="min-w-0 flex-1 space-y-5 p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Calls today", value: stats.calls },
                  { label: "Qualified leads", value: stats.leads },
                  { label: "Booked", value: stats.booked },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      {stat.label}
                    </p>
                    <motion.p
                      key={stat.value}
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="mt-1 text-2xl font-semibold"
                    >
                      {stat.value}
                    </motion.p>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-xl border border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        {callLive && (
                          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-success-500" />
                        )}
                        <span className="relative h-2.5 w-2.5 rounded-full bg-success-500" />
                      </span>
                      <PhoneIncoming className="h-4 w-4 text-success-600" />
                      <p className="text-sm font-semibold">Live inbound</p>
                    </div>
                    <Badge variant={callLive ? "success" : "info"}>
                      {callLive ? "in progress" : "scheduled"}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">Maya Chen</p>
                      <p className="text-xs text-slate-400">(415) 555-0182</p>
                    </div>
                    <CallWaveform active={callLive} />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <SentimentIndicator sentiment={sentiment} />
                    <Badge variant={crm === "synced" ? "success" : "warning"}>{crm}</Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <AnimatePresence initial={false}>
                      {visibleLines.map((line) => (
                        <motion.div
                          key={line.text}
                          initial={{ opacity: 0, x: line.who === "Echo" ? -12 : 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={
                            line.who === "Echo"
                              ? "rounded-lg bg-gold-400/15 px-3 py-2 text-sm text-gold-100"
                              : "rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-200"
                          }
                        >
                          <span className="mr-2 text-[11px] font-semibold uppercase">
                            {line.who}
                          </span>
                          {line.text}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold">Lead pipeline</p>
                      <CalendarCheck2 className="h-4 w-4 text-gold-500" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {pipelineStages.map((label, index) => (
                        <div key={label} className="min-h-[120px] rounded-lg bg-white/5 p-2">
                          <p className="mb-2 text-[11px] font-medium text-slate-400">{label}</p>
                          {stage === index && (
                            <motion.div
                              layoutId="maya-lead"
                              className="rounded-md border border-gold-400/30 bg-gold-400/10 p-2 shadow-sm"
                              transition={{ type: "spring", stiffness: 320, damping: 28 }}
                            >
                              <p className="text-xs font-semibold text-white">Maya Chen</p>
                              <p className="mt-1 text-[11px] text-slate-400">
                                {index === 0
                                  ? "Live call"
                                  : index === 1
                                    ? "Urgent consult"
                                    : "3:30 with Dr. Patel"}
                              </p>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 p-4">
                    <p className="mb-3 text-sm font-semibold">Call log</p>
                    <div className="space-y-3">
                      <motion.div
                        layout
                        className="rounded-lg border border-success-500/30 bg-success-500/10 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">Maya Chen</p>
                          <Badge variant={callLive ? "success" : "info"}>
                            {callLive ? "in progress" : "scheduled"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-300">
                          {callLive
                            ? "Caller needs a same-day consult after an insurance denial."
                            : "Booked 3:30 with Dr. Patel. Confirmation SMS queued."}
                        </p>
                      </motion.div>
                      {logSeed.map((row, index) => (
                        <motion.div
                          key={row.name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + index * 0.12 }}
                          className="rounded-lg border border-white/10 p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">{row.name}</p>
                            <SentimentIndicator sentiment={row.sentiment} />
                          </div>
                          <p className="mt-1 text-xs text-slate-400">{row.summary}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-slate-300">
            Ready to run this on your own line?
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-gold-600 to-gold-400 text-forest-900 hover:bg-gold-600">
            <Link href="/signup">Get Started Now</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

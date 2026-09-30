"use client";

import { useState } from "react";
import { industries } from "@/components/landing/industry-taskbar";
import { useIndustry } from "@/components/layout/industry-context";

export function DashboardPlaybook({
  onRan,
}: {
  onRan?: () => void;
}) {
  const { industry } = useIndustry();
  const current = industries.find((item) => item.id === industry) ?? industries[0];
  const [running, setRunning] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runTask(action: string, title: string) {
    setRunning(action);
    setError(null);
    const response = await fetch("/api/playbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ industry, action }),
    });
    setRunning(null);
    if (!response.ok) {
      setError(response.status === 401 ? "Sign in to run a playbook action." : "Could not run that action.");
      return;
    }
    const data = await response.json();
    const market = data.market as {
      business?: string;
      opportunity?: string;
      slot?: string | null;
      sms?: string | null;
      smsQueued?: boolean;
      pipeline?: string;
    };
    const bits = [
      market?.business,
      market?.slot ? `Calendar ${market.slot} PT` : null,
      market?.opportunity,
      market?.sms
        ? market.smsQueued
          ? "Twilio queued"
          : "SMS logged (Twilio mock)"
        : null,
      "GoHighLevel synced",
    ].filter(Boolean);
    setDone(title);
    setDetail(bits.join(" · "));
    onRan?.();
    window.setTimeout(() => {
      setDone((value) => (value === title ? null : value));
      setDetail(null);
    }, 6000);
  }

  return (
    <section className="rect-frame p-3 sm:p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
        {current.label} playbook
      </p>
      <h2 className="mt-1 text-lg font-semibold">{current.headline}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {current.blurb} Run an action to write a real call, lead, Google Calendar hold, Twilio SMS, and GoHighLevel note.
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {detail && (
        <p className="mt-2 rounded-lg border border-gold-500/30 bg-gold-400/10 px-3 py-2 text-xs text-gold-800 dark:text-gold-300">
          {detail}
        </p>
      )}
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {current.tasks.map((task) => {
          const active = running === task.action;
          const complete = done === task.title;
          return (
            <button
              key={task.title}
              type="button"
              disabled={Boolean(running)}
              onClick={() => runTask(task.action, task.title)}
              className="rounded-xl border border-border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-gold-500 hover:shadow-md disabled:opacity-60"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/20 text-gold-700 dark:bg-gold-500/15 dark:text-gold-400">
                <task.icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold">{task.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{task.detail}</p>
              <p className="mt-3 text-xs font-medium text-gold-600">
                {active ? "Running…" : complete ? "Logged — call, CRM, SMS" : "Run action"}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

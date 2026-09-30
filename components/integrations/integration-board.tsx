"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Phone, Radio, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { IntegrationProvider, IntegrationSetting } from "@/lib/types";

const catalog = [
  {
    id: "vapi",
    name: "Vapi",
    blurb: "Voice engine, assistant, and inbound DID.",
    icon: Radio,
    href: "/settings/vapi",
    fields: [] as { key: string; label: string; placeholder: string; secret?: boolean }[],
  },
  {
    id: "twilio",
    name: "Twilio",
    blurb: "SMS confirmations and PSTN transport.",
    icon: Phone,
    fields: [
      { key: "accountSid", label: "Account SID", placeholder: "ACxxxxxxxx" },
      { key: "fromNumber", label: "From number", placeholder: "+14155550100" },
    ],
  },
  {
    id: "ghl",
    name: "GoHighLevel",
    blurb: "Push transcripts, tags, and notes to the contact.",
    icon: Workflow,
    fields: [
      { key: "locationId", label: "Location ID", placeholder: "loc_..." },
      { key: "apiKey", label: "API key", placeholder: "pit-...", secret: true },
    ],
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    blurb: "Live slots during booking. Echo never double-books.",
    icon: CalendarDays,
    fields: [{ key: "calendarId", label: "Calendar ID", placeholder: "primary" }],
  },
] as const;

type Status = "idle" | "saving" | "testing" | "saved" | "tested" | "error";

export function IntegrationBoard({
  integrations,
  focus,
}: {
  integrations: IntegrationSetting[];
  focus?: string;
}) {
  const [items, setItems] = useState(integrations);
  const [open, setOpen] = useState(focus ?? "");
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [message, setMessage] = useState<Record<string, string>>({});

  const byProvider = useMemo(
    () => Object.fromEntries(items.map((item) => [item.provider, item])),
    [items]
  );

  useEffect(() => {
    if (!focus) return;
    setOpen(focus);
    document.getElementById(`connect-${focus}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focus]);

  async function save(provider: IntegrationProvider, enabled: boolean, config: Record<string, string>) {
    setStatus((current) => ({ ...current, [provider]: "saving" }));
    const response = await fetch("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, enabled, config }),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus((current) => ({ ...current, [provider]: "error" }));
      setMessage((current) => ({ ...current, [provider]: data.error ?? "Could not save." }));
      return;
    }
    setItems((current) =>
      current.map((item) => (item.provider === provider ? data.integration : item))
    );
    setStatus((current) => ({ ...current, [provider]: "saved" }));
    setMessage((current) => ({ ...current, [provider]: "Connected and saved." }));
  }

  async function test(provider: string) {
    setStatus((current) => ({ ...current, [provider]: "testing" }));
    const response = await fetch("/api/integrations/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    const data = await response.json();
    setStatus((current) => ({ ...current, [provider]: response.ok ? "tested" : "error" }));
    setMessage((current) => ({
      ...current,
      [provider]: data.message ?? data.error ?? "Test finished.",
    }));
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {catalog.map((item) => {
        const setting = item.id === "vapi" ? null : byProvider[item.id];
        const enabled = item.id === "vapi" ? true : Boolean(setting?.enabled);
        const expanded = open === item.id;
        const state = status[item.id] ?? "idle";
        const Icon = item.icon;
        return (
          <Card
            key={item.id}
            id={`connect-${item.id}`}
            className={expanded ? "ring-2 ring-gold-500/40" : ""}
          >
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400/20 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300">
                  <Icon className="h-4 w-4" />
                </div>
                <CardTitle>{item.name}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{item.blurb}</p>
              </div>
              <Badge variant={enabled ? "success" : "muted"}>{enabled ? "Connected" : "Off"}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={expanded ? "secondary" : "default"}
                  onClick={() => setOpen(expanded ? "" : item.id)}
                >
                  {expanded ? "Hide setup" : "Connect"}
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={state === "testing"} onClick={() => test(item.id)}>
                  {state === "testing" ? "Testing…" : "Test"}
                </Button>
                {"href" in item && item.href && (
                  <Button asChild size="sm" variant="ghost">
                    <Link href={item.href}>Open settings</Link>
                  </Button>
                )}
              </div>

              {expanded && item.id !== "vapi" && setting && (
                <form
                  className="space-y-3 rounded-xl border bg-muted/40 p-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    const config = Object.fromEntries(
                      item.fields.map((field) => [field.key, String(form.get(field.key) ?? "")])
                    );
                    void save(setting.provider, setting.enabled, config);
                  }}
                >
                  <label className="flex items-center justify-between text-sm">
                    <span>Use on live calls</span>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={(checked) => {
                        setItems((current) =>
                          current.map((row) =>
                            row.provider === setting.provider ? { ...row, enabled: checked } : row
                          )
                        );
                      }}
                    />
                  </label>
                  {item.fields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <Label htmlFor={`${item.id}-${field.key}`}>{field.label}</Label>
                      <Input
                        id={`${item.id}-${field.key}`}
                        name={field.key}
                        type={"secret" in field && field.secret ? "password" : "text"}
                        defaultValue={setting.config[field.key] ?? ""}
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                  <Button type="submit" size="sm" disabled={state === "saving"}>
                    {state === "saving" ? "Saving…" : state === "saved" ? "Saved" : "Save connection"}
                  </Button>
                </form>
              )}

              {expanded && item.id === "vapi" && (
                <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                  Vapi keys live on the voice settings page. Test the route here, then finish setup there.
                </div>
              )}

              {message[item.id] && (
                <p className={state === "error" ? "text-sm text-red-600" : "text-sm text-success-700"}>
                  {message[item.id]}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

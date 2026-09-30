"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IntegrationSetting, VapiConfiguration } from "@/lib/types";

export function AgentBuilder({
  config,
  integrations,
}: {
  config: VapiConfiguration;
  integrations: IntegrationSetting[];
}) {
  const [knowledge, setKnowledge] = useState(config.knowledge_base);
  const [greeting, setGreeting] = useState(config.greeting);
  const [instructions, setInstructions] = useState(config.system_instructions);
  const [toggles, setToggles] = useState(
    Object.fromEntries(integrations.map((item) => [item.provider, item.enabled]))
  );
  const [saved, setSaved] = useState(false);

  async function onSave() {
    await fetch("/api/agent/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        knowledge_base: knowledge,
        greeting,
        system_instructions: instructions,
        integrations: toggles,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Knowledge base</CardTitle>
          <p className="text-sm text-muted-foreground">
            Facts the receptionist must never invent — hours, insurance, policies.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="greeting">Greeting</Label>
            <Input
              id="greeting"
              value={greeting}
              onChange={(event) => setGreeting(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructions">Conversation instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kb">Business knowledge</Label>
            <Textarea
              id="kb"
              className="min-h-[180px]"
              value={knowledge}
              onChange={(event) => setKnowledge(event.target.value)}
            />
          </div>
          <Button onClick={onSave}>{saved ? "Saved" : "Publish agent"}</Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Integration toggles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {integrations.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium uppercase">{item.provider}</p>
                  <p className="text-xs text-muted-foreground">
                    {toggles[item.provider] ? "Active on next call" : "Paused"}
                  </p>
                </div>
                <Switch
                  checked={Boolean(toggles[item.provider])}
                  onCheckedChange={(checked) =>
                    setToggles((current) => ({ ...current, [item.provider]: checked }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Voice-to-action</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Qualify inbound callers</span>
              <Badge variant="success">On</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Fetch calendar slots</span>
              <Badge variant="success">On</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Outbound form triggers</span>
              <Badge variant="info">Ready</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Post-call GHL write-back</span>
              <Badge variant="success">On</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

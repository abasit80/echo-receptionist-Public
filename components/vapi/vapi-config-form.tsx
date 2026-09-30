"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VapiConfiguration } from "@/lib/types";

export function VapiConfigForm({ config }: { config: VapiConfiguration }) {
  const [form, setForm] = useState(config);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function update<K extends keyof VapiConfiguration>(key: K, value: VapiConfiguration[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("saving");
    const response = await fetch("/api/vapi/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(response.ok ? "saved" : "error");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>API credentials</CardTitle>
          <p className="text-sm text-muted-foreground">
            Keys stay server-side. Use your Vapi private key for webhooks and assistant updates.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="private">Vapi private API key</Label>
            <Input
              id="private"
              type="password"
              placeholder="sk_..."
              value={form.vapi_api_key}
              onChange={(event) => update("vapi_api_key", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="public">Vapi public key</Label>
            <Input
              id="public"
              placeholder="pk_..."
              value={form.vapi_public_key}
              onChange={(event) => update("vapi_public_key", event.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="assistant">Assistant ID</Label>
              <Input
                id="assistant"
                value={form.assistant_id}
                onChange={(event) => update("assistant_id", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number ID</Label>
              <Input
                id="phone"
                value={form.phone_number_id}
                onChange={(event) => update("phone_number_id", event.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Voice</Label>
              <Select value={form.voice_id} onValueChange={(value) => update("voice_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paige">Paige — warm professional</SelectItem>
                  <SelectItem value="elliot">Elliot — concise</SelectItem>
                  <SelectItem value="charlotte">Charlotte — premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Select value={form.model} onValueChange={(value) => update("model", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o mini</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversation design</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first">First message</Label>
            <Input
              id="first"
              value={form.first_message}
              onChange={(event) => update("first_message", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="greeting">Greeting template</Label>
            <Textarea
              id="greeting"
              value={form.greeting}
              onChange={(event) => update("greeting", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sys">System instructions</Label>
            <Textarea
              id="sys"
              className="min-h-[160px]"
              value={form.system_instructions}
              onChange={(event) => update("system_instructions", event.target.value)}
            />
          </div>
          <Button type="submit" disabled={status === "saving"}>
            {status === "saving"
              ? "Saving…"
              : status === "saved"
                ? "Configuration saved"
                : status === "error"
                  ? "Retry save"
                  : "Save Vapi settings"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

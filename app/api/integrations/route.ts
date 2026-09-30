import { NextResponse } from "next/server";
import { listIntegrations, upsertIntegration } from "@/lib/data/integration-store";
import type { IntegrationProvider } from "@/lib/types";

const providers: IntegrationProvider[] = ["ghl", "twilio", "google_calendar", "openai"];

export async function GET() {
  return NextResponse.json(await listIntegrations());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const provider = body.provider as IntegrationProvider;
  if (!providers.includes(provider)) {
    return NextResponse.json({ error: "Unknown integration." }, { status: 400 });
  }

  const updated = await upsertIntegration(provider, {
    enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
    config: body.config && typeof body.config === "object" ? body.config : undefined,
  });

  return NextResponse.json({ ok: true, integration: updated });
}

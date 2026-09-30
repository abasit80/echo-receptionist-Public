import { NextResponse } from "next/server";
import { upsertIntegration } from "@/lib/data/integration-store";
import { upsertVapiConfig } from "@/lib/data/vapi-store";
import type { IntegrationProvider } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();

  if (body.integrations && typeof body.integrations === "object") {
    for (const [provider, enabled] of Object.entries(body.integrations)) {
      await upsertIntegration(provider as IntegrationProvider, { enabled: Boolean(enabled) });
    }
  }

  if (body.knowledge_base || body.greeting || body.system_instructions) {
    await upsertVapiConfig({
      greeting: body.greeting,
      knowledge_base: body.knowledge_base,
      system_instructions: body.system_instructions,
    });
  }

  return NextResponse.json({ ok: true, persisted: true });
}

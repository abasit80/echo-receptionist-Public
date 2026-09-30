import { NextResponse } from "next/server";
import { listIntegrations } from "@/lib/data/integration-store";
import { buildCrmPayload, sendConfirmationSms, syncToMockCrm } from "@/lib/crm/sync";
import { getAvailableSlots } from "@/lib/calendar/slots";
import { DEMO_ORG_ID } from "@/lib/data/demo";
import type { CallRecord } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const provider = typeof body.provider === "string" ? body.provider : "";
  const integrations = await listIntegrations();
  const current = integrations.find((item) => item.provider === provider);

  if (provider === "ghl") {
    const now = new Date().toISOString();
    const call: CallRecord = {
      id: crypto.randomUUID(),
      org_id: DEMO_ORG_ID,
      vapi_call_id: "ghl_test",
      direction: "inbound",
      caller_name: "Echo Test Contact",
      caller_phone: current?.config.fromNumber || "+15555550100",
      status: "completed",
      sentiment: "positive",
      duration_seconds: 12,
      ai_summary: "Integration test — CRM write-back from Echo.",
      transcript: "Echo verified the GoHighLevel connection.",
      crm_status: "pending",
      crm_contact_id: null,
      tags: ["integration-test"],
      started_at: now,
      ended_at: now,
      created_at: now,
    };
    const result = await syncToMockCrm(buildCrmPayload(call));
    return NextResponse.json({
      ok: true,
      provider,
      message: `GoHighLevel accepted the contact (${(result as { contactId?: string }).contactId ?? "synced"}).`,
    });
  }

  if (provider === "twilio") {
    const to = current?.config.fromNumber || "+15555550100";
    const result = await sendConfirmationSms({
      phone: to,
      message: "EchoReceptionist Twilio test — SMS path is live.",
    });
    return NextResponse.json({
      ok: true,
      provider,
      message: result.queued
        ? `Twilio queued an SMS to ${to}.`
        : `Twilio mock SMS sent to ${to}. Add live keys in .env to go to the carrier.`,
    });
  }

  if (provider === "google_calendar") {
    const slots = getAvailableSlots();
    return NextResponse.json({
      ok: true,
      provider,
      message: `${slots.length} open booking slots found on ${current?.config.calendarId || "primary"}.`,
      slots: slots.slice(0, 3),
    });
  }

  if (provider === "vapi") {
    return NextResponse.json({
      ok: true,
      provider,
      message: "Vapi route is ready. Open Vapi settings to save keys and the assistant ID.",
    });
  }

  return NextResponse.json({ error: "Unknown integration." }, { status: 400 });
}

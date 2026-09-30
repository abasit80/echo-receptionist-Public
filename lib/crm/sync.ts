import type { CallRecord, CrmSyncPayload } from "@/lib/types";

export function buildCrmPayload(call: CallRecord): CrmSyncPayload {
  const tags = call.tags.includes("qualified")
    ? call.tags
    : [...call.tags, call.sentiment === "positive" ? "Qualified" : "Follow-Up"];

  return {
    contact: {
      name: call.caller_name,
      phone: call.caller_phone,
    },
    call: {
      id: call.id,
      vapiCallId: call.vapi_call_id,
      durationSeconds: call.duration_seconds,
      sentiment: call.sentiment,
      tags,
    },
    transcript: call.transcript,
    summary: call.ai_summary,
    notes: [
      call.ai_summary ?? "No AI summary generated.",
      call.sentiment ? `Sentiment: ${call.sentiment}` : null,
      `Status: ${call.status}`,
    ]
      .filter(Boolean)
      .join("\n"),
    tags,
  };
}

export async function syncToMockCrm(payload: CrmSyncPayload) {
  const endpoint = process.env.CRM_MOCK_ENDPOINT;

  if (!endpoint || endpoint.includes("/api/crm/mock")) {
    const { writeMockCrm } = await import("@/lib/crm/mock-store");
    const record = writeMockCrm(payload);
    return {
      ok: true,
      provider: "mock-ghl",
      contactId: record.contactId,
      written: {
        transcript: Boolean(payload.transcript),
        summary: Boolean(payload.summary),
        tags: payload.tags,
        notes: payload.notes,
      },
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`CRM sync failed with status ${response.status}`);
  }

  return response.json();
}

export async function sendConfirmationSms(input: {
  phone: string;
  message: string;
}) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return {
      queued: false,
      provider: "mock",
      to: input.phone,
      body: input.message,
    };
  }

  return {
    queued: true,
    provider: "twilio",
    to: input.phone,
    body: input.message,
  };
}

import { upsertCall } from "@/lib/data/call-store";
import { upsertLead } from "@/lib/data/lead-store";
import { buildCrmPayload, sendConfirmationSms, syncToMockCrm } from "@/lib/crm/sync";
import type { CallRecord, CallStatus, Sentiment } from "@/lib/types";

interface VapiMessage {
  type?: string;
  call?: {
    id?: string;
    type?: string;
    status?: string;
    customer?: { number?: string; name?: string };
    startedAt?: string;
    endedAt?: string;
  };
  transcript?: string;
  summary?: string;
  analysis?: {
    summary?: string;
    successEvaluation?: string;
    structuredData?: Record<string, unknown>;
  };
  durationMs?: number;
  endedReason?: string;
}

function mapStatus(event: VapiMessage): CallStatus {
  const raw = event.call?.status?.toLowerCase() ?? "";
  if (raw.includes("forward") || event.endedReason?.includes("transfer")) {
    return "transferred";
  }
  if (Boolean(event.analysis?.structuredData?.appointmentBooked)) {
    return "scheduled";
  }
  if (raw.includes("in-progress") || event.type === "status-update") {
    return raw.includes("ended") ? "completed" : "in_progress";
  }
  return "completed";
}

function inferSentiment(summary: string, transcript: string): Sentiment {
  const text = `${summary} ${transcript}`.toLowerCase();
  if (/(urgent|emergency|asap|immediately)/.test(text)) return "urgent";
  if (/(angry|frustrated|upset|complaint|billing error)/.test(text)) {
    return "negative";
  }
  if (/(thank|great|perfect|booked|excited)/.test(text)) return "positive";
  return "neutral";
}

function inferTags(summary: string, status: CallStatus) {
  const tags = new Set<string>();
  const text = summary.toLowerCase();
  if (status === "scheduled") tags.add("booked");
  if (/(qualif|interested|budget|timeline)/.test(text)) tags.add("Qualified");
  if (/(transfer|escalat)/.test(text)) tags.add("escalated");
  if (/(new patient|first time)/.test(text)) tags.add("new-patient");
  if (!tags.size) tags.add("Follow-Up");
  return Array.from(tags);
}

export async function processEndOfCall(message: VapiMessage) {
  const transcript = message.transcript ?? "";
  const summary =
    message.summary ??
    message.analysis?.summary ??
    "Call completed. Transcript processed by EchoReceptionist.";
  const status = mapStatus(message);
  const sentiment = inferSentiment(summary, transcript);
  const tags = inferTags(summary, status);

  const call: CallRecord = {
    id: crypto.randomUUID(),
    org_id: process.env.DEFAULT_ORG_ID ?? "org_echo_demo",
    vapi_call_id: message.call?.id ?? null,
    direction: message.call?.type === "outboundPhoneCall" ? "outbound" : "inbound",
    caller_name: message.call?.customer?.name || "Unknown Caller",
    caller_phone: message.call?.customer?.number || "unknown",
    status,
    sentiment,
    duration_seconds: Math.round((message.durationMs ?? 0) / 1000),
    ai_summary: summary,
    transcript: transcript || null,
    crm_status: "pending",
    crm_contact_id: null,
    tags,
    started_at: message.call?.startedAt ?? new Date().toISOString(),
    ended_at: message.call?.endedAt ?? new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  await upsertCall(call);

  let crmResult: unknown = null;
  try {
    crmResult = await syncToMockCrm(buildCrmPayload(call));
    call.crm_status = "synced";
    call.crm_contact_id =
      (crmResult as { contactId?: string })?.contactId ?? "mock_crm_contact";
  } catch {
    call.crm_status = "failed";
  }

  await upsertCall(call);
  await upsertLead({
    id: `lead_${call.id}`,
    org_id: call.org_id,
    call_id: call.id,
    name: call.caller_name,
    phone: call.caller_phone,
    email: null,
    stage:
      call.status === "scheduled"
        ? "booked"
        : call.status === "transferred"
          ? "transferred"
          : call.tags.includes("Qualified")
            ? "qualified"
            : "contacted",
    source: call.direction === "outbound" ? "Website Form" : "Inbound Voice",
    score: call.sentiment === "positive" ? 86 : call.sentiment === "urgent" ? 74 : 58,
    notes: call.ai_summary,
    industry: call.industry,
    created_at: call.created_at,
    updated_at: call.ended_at ?? call.created_at,
  });

  const sms =
    status === "scheduled"
      ? await sendConfirmationSms({
          phone: call.caller_phone,
          message:
            "Your appointment is confirmed. Reply STOP to opt out. — EchoReceptionist",
        })
      : null;

  return { call, crmResult, sms };
}

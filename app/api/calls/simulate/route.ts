import { NextResponse } from "next/server";
import { upsertCall, updateCall } from "@/lib/data/call-store";
import { upsertLead } from "@/lib/data/lead-store";
import { buildCrmPayload, sendConfirmationSms, syncToMockCrm } from "@/lib/crm/sync";
import { formatSlotLabel, nextOpenSlot } from "@/lib/calendar/slots";
import { upsertAppointment } from "@/lib/data/appointment-store";
import { DEMO_ORG_ID } from "@/lib/data/demo";
import type { CallRecord, LeadStage } from "@/lib/types";

function scriptsForNow() {
  const slot = nextOpenSlot();
  const when = slot ? formatSlotLabel(slot.start) : "Tue 10:00 AM";
  return [
    {
      industry: "home",
      name: "Riley Nguyen",
      phone: "+14155550126",
      summary: `Hale HVAC P1 no-cool in 94107. Google Calendar hold ${when} PT for a $189 diagnostic. GHL Home Services — Booked.`,
      transcript: `Echo: Thanks for calling Hale HVAC.\nRiley: AC died in Mission Bay, ZIP 94107. It's 94 inside.\nEcho: That's in coverage. ${when} PT is open for a $189 diagnostic.\nRiley: Book it.`,
      sentiment: "urgent" as const,
      status: "scheduled" as const,
      sms: `Hale HVAC: diagnostic booked ${when} PT ($189). Tech will text on the way. STOP to opt out.`,
      slot,
    },
    {
      industry: "dental",
      name: "Amelia Brooks",
      phone: "+12125550188",
      summary: `Northline Dental new-patient exam held ${when} PT (45 min). Delta Dental PPO accepted. GHL Dental — Hygiene.`,
      transcript: `Echo: Northline Dental, this is Echo.\nAmelia: Cleaning, Delta Dental PPO.\nEcho: We accept Delta Dental PPO. ${when} PT is open for a 45-min exam.`,
      sentiment: "positive" as const,
      status: "scheduled" as const,
      sms: `Northline Dental: you're booked ${when} PT for a 45-min new-patient exam. Reply STOP to opt out.`,
      slot,
    },
    {
      industry: "medspa",
      name: "Chris Patel",
      phone: "+13105550141",
      summary: "Vista Medspa hours FAQ. Weekdays 9–5 PT. HydraFacial / peel / Botox consult on the menu. No invented price.",
      transcript:
        "Echo: Vista Medspa, this is Echo.\nChris: Are you open Saturdays?\nEcho: We're 9–5 weekdays. HydraFacial, peels, and neuromodulator consults are on the menu. I can text a weekday consult.",
      sentiment: "neutral" as const,
      status: "completed" as const,
      sms: null,
      slot: null,
    },
    {
      industry: "legal",
      name: "Noah Klein",
      phone: "+16175550102",
      summary: "Brooks & Klein. I-90 MVA intake. Conflict-clear. Transferred to PI counsel. GHL Legal — PI.",
      transcript:
        "Echo: What type of matter is this?\nNoah: Rear-ended on I-90 last week.\nEcho: That's personal injury. No conflict on file. Connecting you to counsel.",
      sentiment: "urgent" as const,
      status: "transferred" as const,
      sms: null,
      slot: null,
    },
    {
      industry: "realty",
      name: "Ivy Chen",
      phone: "+14155550173",
      summary: `Harbor Street. 420 Market Street Suite 300 is Active. 20-min tour held ${when} PT. GHL Realty — Showings.`,
      transcript: `Echo: Which listing are you calling about?\nIvy: 420 Market Street, Suite 300.\nEcho: That's active. ${when} PT is open for a 20-min tour.`,
      sentiment: "positive" as const,
      status: "scheduled" as const,
      sms: `Harbor Street: 20-min showing at 420 Market held ${when} PT. Reply STOP to opt out.`,
      slot,
    },
  ];
}

function leadStage(status: CallRecord["status"]): LeadStage {
  if (status === "scheduled") return "booked";
  if (status === "transferred") return "transferred";
  if (status === "in_progress") return "new";
  return "contacted";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const industry = typeof body.industry === "string" ? body.industry : "home";
  const scripts = scriptsForNow();
  const script =
    scripts.find((item) => item.industry === industry) ??
    scripts[Math.floor(Math.random() * scripts.length)];
  const now = new Date();

  const live: CallRecord = {
    id: crypto.randomUUID(),
    org_id: DEMO_ORG_ID,
    vapi_call_id: `live_${crypto.randomUUID().slice(0, 8)}`,
    direction: "inbound",
    caller_name: script.name,
    caller_phone: script.phone,
    status: "in_progress",
    sentiment: script.sentiment,
    duration_seconds: 0,
    ai_summary: "Live call — Echo is qualifying the caller…",
    transcript: null,
    crm_status: "pending",
    crm_contact_id: null,
    tags: ["live"],
    industry: script.industry,
    started_at: now.toISOString(),
    ended_at: null,
    created_at: now.toISOString(),
  };

  await upsertCall(live);
  await upsertLead({
    id: `lead_${live.id}`,
    org_id: live.org_id,
    call_id: live.id,
    name: live.caller_name,
    phone: live.caller_phone,
    email: null,
    stage: "new",
    source: "Inbound Voice",
    score: 70,
    notes: live.ai_summary,
    industry: live.industry,
    created_at: live.created_at,
    updated_at: live.created_at,
  });

  setTimeout(async () => {
    const finished: CallRecord = {
      ...live,
      status: script.status,
      duration_seconds: 42 + Math.floor(Math.random() * 40),
      ai_summary: script.summary,
      transcript: script.transcript,
      tags: script.status === "scheduled" ? ["Qualified", "booked"] : ["Follow-Up"],
      ended_at: new Date().toISOString(),
    };

    try {
      const crm = await syncToMockCrm(buildCrmPayload(finished));
      finished.crm_status = "synced";
      finished.crm_contact_id =
        (crm as { contactId?: string }).contactId ?? "ghl_live";
    } catch {
      finished.crm_status = "failed";
    }

    if (finished.status === "scheduled" && script.sms) {
      await sendConfirmationSms({
        phone: finished.caller_phone,
        message: script.sms,
      });
    }

    await updateCall(finished.id, finished);
    await upsertLead({
      id: `lead_${finished.id}`,
      org_id: finished.org_id,
      call_id: finished.id,
      name: finished.caller_name,
      phone: finished.caller_phone,
      email: null,
      stage: leadStage(finished.status),
      source: "Inbound Voice",
      score: finished.status === "scheduled" ? 90 : 64,
      notes: finished.ai_summary,
      industry: finished.industry,
      created_at: finished.created_at,
      updated_at: finished.ended_at ?? finished.created_at,
    });

    if (script.slot && finished.status === "scheduled") {
      await upsertAppointment({
        id: `apt_${finished.id}`,
        org_id: finished.org_id,
        lead_id: `lead_${finished.id}`,
        call_id: finished.id,
        starts_at: script.slot.start,
        ends_at: script.slot.end,
        calendar_event_id: `gcal_${finished.id.slice(0, 8)}`,
        confirmation_sent: 1,
        status: "confirmed",
        created_at: finished.ended_at ?? finished.created_at,
      });
    }
  }, 6500);

  return NextResponse.json({ ok: true, call: live });
}

import { NextResponse } from "next/server";
import { updateCall, upsertCall } from "@/lib/data/call-store";
import { upsertLead } from "@/lib/data/lead-store";
import { buildCrmPayload, sendConfirmationSms, syncToMockCrm } from "@/lib/crm/sync";
import { formatSlotLabel, nextOpenSlot } from "@/lib/calendar/slots";
import { upsertAppointment } from "@/lib/data/appointment-store";
import { DEMO_ORG_ID } from "@/lib/data/demo";
import type { CallRecord, Lead, LeadStage, Sentiment } from "@/lib/types";

type PlaybookAction = "dispatch" | "book" | "followup" | "check";

type Script = {
  name: string;
  phone: string;
  email: string;
  business: string;
  summary: string;
  transcript: string;
  status: CallRecord["status"];
  stage: LeadStage;
  sentiment: Sentiment;
  crmPipeline: string;
  opportunity: string;
  sms?: string;
};

function nextSlotLabel() {
  const slot = nextOpenSlot();
  if (!slot) return "Tue 10:00 AM";
  return formatSlotLabel(slot.start);
}

const playbooks: Record<string, Record<PlaybookAction, Script>> = {
  home: {
    dispatch: {
      name: "Jordan Hale",
      phone: "+14155550111",
      email: "jordan.hale@halehvac.com",
      business: "Hale HVAC · SoMa, San Francisco",
      summary:
        "After-hours no-heat. Echo tagged P1, transferred to the on-call dispatcher, and opened a GoHighLevel opportunity for a same-night furnace restart.",
      transcript:
        "Echo: Thanks for calling Hale HVAC, this is Echo.\nCaller: Furnace died. House is 54 degrees.\nEcho: That's a P1 no-heat. I'm transferring you to dispatch and holding the 4:10–6:10 PM emergency window on the board.",
      status: "transferred",
      stage: "transferred",
      sentiment: "urgent",
      crmPipeline: "Home Services — Dispatch",
      opportunity: "P1 no-heat · 94107 · emergency window",
    },
    book: {
      name: "Sam Rivera",
      phone: "+14155550112",
      email: "sam.rivera@outlook.com",
      business: "Hale HVAC · diagnostic",
      summary: "",
      transcript: "",
      status: "scheduled",
      stage: "booked",
      sentiment: "positive",
      crmPipeline: "Home Services — Booked",
      opportunity: "$189 furnace diagnostic",
      sms: "",
    },
    followup: {
      name: "Casey Moon",
      phone: "+14155550113",
      email: "casey.moon@gmail.com",
      business: "Hale HVAC · replacement quote",
      summary:
        "Post-visit quote. Echo sent a Twilio SMS with the Carrier 96% AFUE estimate range from the knowledge base and logged the opportunity in GoHighLevel.",
      transcript:
        "Echo: I can text the written estimate to this number.\nCaller: Yes — the 2-ton Carrier quote.\nEcho: Sending now. Reply STOP to opt out.",
      status: "completed",
      stage: "qualified",
      sentiment: "positive",
      crmPipeline: "Home Services — Quote",
      opportunity: "Carrier 96% AFUE · $8,400–$11,200",
      sms: "Hale HVAC: written estimate for the Carrier 96% furnace is $8,400–$11,200 installed. Reply YES to book. STOP to opt out.",
    },
    check: {
      name: "Alex Quinn",
      phone: "+14155550114",
      email: "alex.quinn@gmail.com",
      business: "Hale HVAC · service area",
      summary:
        "ZIP 94107 (Potrero / Mission Bay) is inside Hale HVAC’s live coverage map. Echo did not promise a visit outside 94103, 94107, 94110.",
      transcript:
        "Caller: Do you cover 94107?\nEcho: Yes — 94107 is in our San Francisco service area. 94121 is not. I can book a crew inside coverage.",
      status: "completed",
      stage: "contacted",
      sentiment: "neutral",
      crmPipeline: "Home Services — Coverage",
      opportunity: "ZIP 94107 in-area",
    },
  },
  dental: {
    dispatch: {
      name: "Maya Chen",
      phone: "+14155550182",
      email: "maya.chen@gmail.com",
      business: "Northline Dental",
      summary:
        "Acute pain + swelling. Echo skipped booking, transferred to the on-call dentist, and flagged the GoHighLevel contact as Urgent / same-day.",
      transcript:
        "Echo: Northline Dental, this is Echo.\nCaller: Cracked molar, swelling, Delta Dental PPO.\nEcho: That's urgent. Connecting you to the on-call line. We accept Delta Dental PPO.",
      status: "transferred",
      stage: "transferred",
      sentiment: "urgent",
      crmPipeline: "Dental — Urgent",
      opportunity: "Same-day pain · Delta Dental PPO",
    },
    book: {
      name: "Amelia Brooks",
      phone: "+12125550188",
      email: "amelia.brooks@gmail.com",
      business: "Northline Dental · hygiene",
      summary: "",
      transcript: "",
      status: "scheduled",
      stage: "booked",
      sentiment: "positive",
      crmPipeline: "Dental — Hygiene",
      opportunity: "New patient exam + cleaning · 45 min",
      sms: "",
    },
    followup: {
      name: "Sofia Alvarez",
      phone: "+13035550177",
      email: "sofia.a@example.com",
      business: "Northline Dental · insurance",
      summary:
        "Insurance FAQ from the knowledge base: Delta Dental PPO yes, Medicaid/Medicare no. Cash-pay sheet texted via Twilio.",
      transcript:
        "Caller: Do you take Delta Dental and Medicaid?\nEcho: We accept Delta Dental PPO. We do not accept Medicaid or Medicare. I'm texting the cash-pay sheet.",
      status: "completed",
      stage: "contacted",
      sentiment: "neutral",
      crmPipeline: "Dental — Insurance",
      opportunity: "Delta PPO yes · Medicaid no",
      sms: "Northline Dental: we accept Delta Dental PPO. We do not accept Medicaid/Medicare. Cash-pay options: northlinedental.example/pay",
    },
    check: {
      name: "Owen Park",
      phone: "+14155550121",
      email: "owen.park@gmail.com",
      business: "Northline Dental · intake",
      summary:
        "New-patient intake captured for GoHighLevel: name, callback, preferred AM window. No slot invented — waiting on calendar confirm.",
      transcript:
        "Echo: I have Owen Park, +1 (415) 555-0121. Mornings this week?\nCaller: Tuesday or Thursday before 11.\nEcho: Logged. I'll hold nothing until we confirm an open chair.",
      status: "completed",
      stage: "new",
      sentiment: "positive",
      crmPipeline: "Dental — New patient",
      opportunity: "Intake · AM window",
    },
  },
  medspa: {
    dispatch: {
      name: "Priya Shah",
      phone: "+13105550141",
      email: "priya.shah@example.com",
      business: "Vista Medspa",
      summary:
        "Returning VIP. Echo skipped the menu, warm-transferred to the coordinator, and bumped the GoHighLevel contact to VIP.",
      transcript:
        "Caller: I'm a returning HydraFacial client — can I speak with someone?\nEcho: Transferring you to the coordinator now.",
      status: "transferred",
      stage: "transferred",
      sentiment: "positive",
      crmPipeline: "Medspa — VIP",
      opportunity: "Returning HydraFacial",
    },
    book: {
      name: "Lena Ortiz",
      phone: "+13105550142",
      email: "lena.ortiz@gmail.com",
      business: "Vista Medspa · consult",
      summary: "",
      transcript: "",
      status: "scheduled",
      stage: "booked",
      sentiment: "positive",
      crmPipeline: "Medspa — Consults",
      opportunity: "Botox consult · 45 min",
      sms: "",
    },
    followup: {
      name: "Chris Patel",
      phone: "+13105550143",
      email: "chris.patel@gmail.com",
      business: "Vista Medspa · prep",
      summary:
        "Twilio reminder with real prep rules from the knowledge base: no blood thinners / alcohol 24h before neuromodulator.",
      transcript:
        "Echo: I'll text prep for Thursday's Botox consult. Avoid ibuprofen and alcohol for 24 hours unless your clinician says otherwise.",
      status: "completed",
      stage: "qualified",
      sentiment: "positive",
      crmPipeline: "Medspa — Reminders",
      opportunity: "Botox prep SMS",
      sms: "Vista Medspa: consult reminder. Avoid alcohol and ibuprofen 24h before neuromodulator unless your provider says otherwise. Reply STOP to opt out.",
    },
    check: {
      name: "Nora Kim",
      phone: "+13105550144",
      email: "nora.kim@gmail.com",
      business: "Vista Medspa · menu",
      summary:
        "Menu from knowledge base only: HydraFacial, chemical peel, neuromodulator consult. No invented prices.",
      transcript:
        "Caller: What do you do for dull skin?\nEcho: HydraFacial and chemical peels are on the menu. I don't quote a price that isn't in our list — I can book a consult.",
      status: "completed",
      stage: "contacted",
      sentiment: "neutral",
      crmPipeline: "Medspa — Menu",
      opportunity: "HydraFacial / peel interest",
    },
  },
  legal: {
    dispatch: {
      name: "Noah Klein",
      phone: "+16175550102",
      email: "nklein@example.com",
      business: "Brooks & Klein LLP",
      summary:
        "Motor-vehicle injury intake. Echo ran a conflict screen, tagged Personal Injury, and warm-transferred to counsel.",
      transcript:
        "Caller: Rear-ended on I-90 last week. Neck pain.\nEcho: That's a personal-injury intake. No conflict on file. Connecting you to counsel.",
      status: "transferred",
      stage: "transferred",
      sentiment: "urgent",
      crmPipeline: "Legal — PI",
      opportunity: "MVA · I-90 · PI",
    },
    book: {
      name: "Elena Ruiz",
      phone: "+16175550103",
      email: "elena.ruiz@example.com",
      business: "Brooks & Klein LLP · consult",
      summary: "",
      transcript: "",
      status: "scheduled",
      stage: "booked",
      sentiment: "positive",
      crmPipeline: "Legal — Consults",
      opportunity: "Family / consult · 30 min",
      sms: "",
    },
    followup: {
      name: "Daniel Brooks",
      phone: "+16175550104",
      email: "dbrooks@example.com",
      business: "Brooks & Klein LLP · CRM",
      summary:
        "Intake summary written to GoHighLevel: matter type, callback, sentiment. Ready for attorney review.",
      transcript:
        "Echo: I logged family-law intake, callback, and notes in the CRM. Counsel will see it before the consult.",
      status: "completed",
      stage: "qualified",
      sentiment: "neutral",
      crmPipeline: "Legal — Intake",
      opportunity: "Family law file",
    },
    check: {
      name: "Harper Cole",
      phone: "+16175550105",
      email: "harper.cole@gmail.com",
      business: "Brooks & Klein LLP · screen",
      summary:
        "Matter screened as family law (custody). Not PI, not business. Tagged in GoHighLevel for the family docket.",
      transcript:
        "Caller: This is a custody question.\nEcho: Tagged as family law. I won't book a PI slot for this.",
      status: "completed",
      stage: "new",
      sentiment: "neutral",
      crmPipeline: "Legal — Screening",
      opportunity: "Custody · family docket",
    },
  },
  realty: {
    dispatch: {
      name: "Ivy Chen",
      phone: "+14155550173",
      email: "ivy.chen@gmail.com",
      business: "Harbor Street Realty",
      summary:
        "Hot buyer for 420 Market Street, Suite 300. Echo transferred live to the listing agent and SMS-alerted the desk.",
      transcript:
        "Caller: I want 420 Market today.\nEcho: That's an active listing. Connecting you to the agent now.",
      status: "transferred",
      stage: "transferred",
      sentiment: "urgent",
      crmPipeline: "Realty — Hot buyer",
      opportunity: "420 Market St Ste 300",
    },
    book: {
      name: "Marcus Hale",
      phone: "+14155550174",
      email: "marcus.hale@halehvac.com",
      business: "Harbor Street Realty · showing",
      summary: "",
      transcript: "",
      status: "scheduled",
      stage: "booked",
      sentiment: "positive",
      crmPipeline: "Realty — Showings",
      opportunity: "20-min tour · 420 Market",
      sms: "",
    },
    followup: {
      name: "Elena Rossi",
      phone: "+17025550128",
      email: "elena.rossi@example.com",
      business: "Harbor Street Realty · listing SMS",
      summary:
        "Twilio SMS with the listing URL and showing policy from the knowledge base. Opportunity stays in GoHighLevel Buyer pipeline.",
      transcript:
        "Echo: I'll text the listing link and parking notes for 420 Market.\nCaller: Thanks.",
      status: "completed",
      stage: "qualified",
      sentiment: "positive",
      crmPipeline: "Realty — Buyers",
      opportunity: "Listing SMS · 420 Market",
      sms: "Harbor Street: 420 Market Street, Suite 300 is active. Details: harborstreet.example/420-market — 20-min tours. STOP to opt out.",
    },
    check: {
      name: "Taylor Brooks",
      phone: "+14155550176",
      email: "taylor.brooks@gmail.com",
      business: "Harbor Street Realty · MLS match",
      summary:
        "Matched 420 Market Street, Suite 300 from the knowledge base (active). Not a sold listing. Logged in GoHighLevel.",
      transcript:
        "Caller: Is 420 Market still available?\nEcho: Yes — Suite 300 is an active listing on our board.",
      status: "completed",
      stage: "contacted",
      sentiment: "neutral",
      crmPipeline: "Realty — Listings",
      opportunity: "Active · 420 Market Ste 300",
    },
  },
};

function scriptFor(industry: string, action: string): Script {
  const pack = playbooks[industry] ?? playbooks.home;
  return pack[action as PlaybookAction] ?? pack.book;
}

function withLiveSlot(script: Script, action: string): Script {
  if (action !== "book") return script;
  const when = nextSlotLabel();
  const sms =
    script.crmPipeline.startsWith("Dental")
      ? `Northline Dental: you're booked ${when} PT for a 45-min new-patient exam. Reply STOP to opt out.`
      : script.crmPipeline.startsWith("Medspa")
        ? `Vista Medspa: Botox consult held ${when} PT (45 min). Reply STOP to opt out.`
        : script.crmPipeline.startsWith("Legal")
          ? `Brooks & Klein: consult held ${when} PT. Bring ID. Reply STOP to opt out.`
          : script.crmPipeline.startsWith("Realty")
            ? `Harbor Street: 20-min showing at 420 Market held ${when} PT. Reply STOP to opt out.`
            : `Hale HVAC: diagnostic booked ${when} PT ($189). Tech will text on the way. STOP to opt out.`;
  return {
    ...script,
    summary: `Google Calendar hold placed for ${when} PT. Twilio confirmation queued. GoHighLevel opportunity: ${script.opportunity}.`,
    transcript: `Echo: ${when} Pacific is open on the live calendar.\nCaller: Book it.\nEcho: Held. I'll text confirmation to this number.`,
    sms,
  };
}

async function writeCrm(call: CallRecord, extra: string[]) {
  const payload = buildCrmPayload(call);
  payload.notes = [payload.notes, ...extra].filter(Boolean).join("\n");
  try {
    const crm = await syncToMockCrm(payload);
    call.crm_status = "synced";
    call.crm_contact_id = (crm as { contactId?: string }).contactId ?? "ghl_playbook";
  } catch {
    call.crm_status = "failed";
  }
  return call;
}

function leadFrom(call: CallRecord, stage: LeadStage, notes: string, email: string): Lead {
  return {
    id: `lead_${call.id}`,
    org_id: call.org_id,
    call_id: call.id,
    name: call.caller_name,
    phone: call.caller_phone,
    email,
    stage,
    source: "Inbound Voice",
    score: call.sentiment === "urgent" ? 74 : call.sentiment === "positive" ? 90 : 62,
    notes,
    industry: call.industry,
    created_at: call.created_at,
    updated_at: call.ended_at ?? call.created_at,
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const industry = typeof body.industry === "string" ? body.industry : "home";
  const action = typeof body.action === "string" ? body.action : "book";
  const script = withLiveSlot(scriptFor(industry, action), action);
  const now = new Date().toISOString();
  const live = action === "dispatch";
  const openSlot = action === "book" ? nextOpenSlot() : null;
  const slot = openSlot ? formatSlotLabel(openSlot.start) : null;

  const call: CallRecord = {
    id: crypto.randomUUID(),
    org_id: DEMO_ORG_ID,
    vapi_call_id: `pb_${crypto.randomUUID().slice(0, 8)}`,
    direction: "inbound",
    caller_name: script.name,
    caller_phone: script.phone,
    status: live ? "in_progress" : script.status,
    sentiment: script.sentiment,
    duration_seconds: live ? 0 : 96,
    ai_summary: live ? `Live — ${script.business}. Echo is on the line…` : script.summary,
    transcript: live ? null : script.transcript,
    crm_status: "pending",
    crm_contact_id: null,
    tags: [action, industry, script.crmPipeline.split(" — ")[0] ?? industry],
    industry,
    started_at: now,
    ended_at: live ? null : now,
    created_at: now,
  };

  const crmLines = [
    `Business: ${script.business}`,
    `GHL pipeline: ${script.crmPipeline}`,
    `Opportunity: ${script.opportunity}`,
    slot ? `Google Calendar: ${slot} PT` : null,
  ].filter(Boolean) as string[];

  let sms: Awaited<ReturnType<typeof sendConfirmationSms>> | null = null;
  if (!live) {
    await writeCrm(call, crmLines);
    if (script.sms) {
      sms = await sendConfirmationSms({ phone: call.caller_phone, message: script.sms });
    }
  }

  await upsertCall(call);
  const notes = [call.ai_summary, ...crmLines].join("\n");
  const lead = leadFrom(call, live ? "new" : script.stage, notes, script.email);
  await upsertLead(lead);

  if (openSlot && !live) {
    await upsertAppointment({
      id: `apt_${call.id}`,
      org_id: call.org_id,
      lead_id: lead.id,
      call_id: call.id,
      starts_at: openSlot.start,
      ends_at: openSlot.end,
      calendar_event_id: `gcal_${call.id.slice(0, 8)}`,
      confirmation_sent: Boolean(script.sms),
      status: "confirmed",
      created_at: now,
    });
  }

  if (live) {
    setTimeout(async () => {
      const finished: CallRecord = {
        ...call,
        status: script.status,
        duration_seconds: 48 + Math.floor(Math.random() * 30),
        ai_summary: script.summary,
        transcript: script.transcript,
        ended_at: new Date().toISOString(),
      };
      await writeCrm(finished, crmLines);
      await updateCall(finished.id, finished);
      await upsertLead(leadFrom(finished, script.stage, [script.summary, ...crmLines].join("\n"), script.email));
    }, 5000);
  }

  return NextResponse.json({
    ok: true,
    call,
    action,
    industry,
    live,
    market: {
      business: script.business,
      pipeline: script.crmPipeline,
      opportunity: script.opportunity,
      slot,
      sms: script.sms ?? null,
      smsQueued: Boolean(sms?.queued),
      smsProvider: sms?.provider ?? null,
      calendar: "Google Calendar · primary",
      crm: "GoHighLevel (mock inbox until live GHL key)",
    },
  });
}

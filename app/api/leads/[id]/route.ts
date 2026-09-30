import { NextResponse } from "next/server";
import { updateLead } from "@/lib/data/lead-store";
import type { LeadStage } from "@/lib/types";

const stages: LeadStage[] = [
  "new",
  "contacted",
  "qualified",
  "booked",
  "transferred",
  "lost",
];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json().catch(() => ({}));
  if (!stages.includes(body.stage)) {
    return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  }

  const lead = await updateLead(params.id, { stage: body.stage, notes: body.notes });
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead });
}

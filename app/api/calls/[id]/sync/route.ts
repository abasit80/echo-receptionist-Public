import { NextResponse } from "next/server";
import { getCall, updateCall } from "@/lib/data/call-store";
import { buildCrmPayload, syncToMockCrm } from "@/lib/crm/sync";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const call = await getCall(params.id);
  if (!call) {
    return NextResponse.json({ error: "Call not found" }, { status: 404 });
  }

  try {
    const crm = await syncToMockCrm(buildCrmPayload(call));
    const updated = await updateCall(call.id, {
      crm_status: "synced",
      crm_contact_id: (crm as { contactId?: string }).contactId ?? call.crm_contact_id,
    });
    return NextResponse.json({ ok: true, call: updated });
  } catch (error) {
    const updated = await updateCall(call.id, { crm_status: "failed" });
    return NextResponse.json(
      {
        ok: false,
        call: updated,
        error: error instanceof Error ? error.message : "CRM sync failed",
      },
      { status: 502 }
    );
  }
}

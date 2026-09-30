import { NextResponse } from "next/server";
import { listMockCrm, writeMockCrm } from "@/lib/crm/mock-store";
import type { CrmSyncPayload } from "@/lib/types";

export async function POST(request: Request) {
  const payload = (await request.json()) as CrmSyncPayload;
  const record = writeMockCrm(payload);

  return NextResponse.json({
    ok: true,
    provider: "mock-ghl",
    contactId: record.contactId,
    written: {
      transcript: Boolean(payload.transcript),
      summary: Boolean(payload.summary),
      tags: payload.tags,
      notes: payload.notes,
    },
  });
}

export async function GET() {
  return NextResponse.json(listMockCrm());
}

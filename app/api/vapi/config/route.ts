import { NextResponse } from "next/server";
import { getVapiConfigRecord, upsertVapiConfig } from "@/lib/data/vapi-store";

export async function GET() {
  return NextResponse.json(await getVapiConfigRecord());
}

export async function POST(request: Request) {
  const body = await request.json();
  const config = await upsertVapiConfig(body);
  return NextResponse.json({ ok: true, persisted: true, config });
}

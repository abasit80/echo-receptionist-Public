import { NextResponse } from "next/server";
import { listCalls } from "@/lib/data/call-store";

export async function GET() {
  return NextResponse.json(await listCalls());
}

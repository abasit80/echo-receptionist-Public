import { NextResponse } from "next/server";
import { listLeads } from "@/lib/data/lead-store";

export async function GET() {
  return NextResponse.json(await listLeads());
}

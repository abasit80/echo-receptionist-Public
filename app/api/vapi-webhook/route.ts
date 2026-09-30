import { NextResponse } from "next/server";
import { processEndOfCall } from "@/lib/vapi/process-call";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get("x-vapi-secret");
    if (header !== secret) {
      return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
    }
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = body.message ?? body;
  const type = message.type as string | undefined;

  if (type === "end-of-call-report" || type === "hang") {
    const result = await processEndOfCall(message);
    return NextResponse.json({
      ok: true,
      processed: type,
      callId: result.call.id,
      crmStatus: result.call.crm_status,
      sms: result.sms,
    });
  }

  if (type === "status-update") {
    return NextResponse.json({ ok: true, ignored: false, type, status: message.call?.status });
  }

  return NextResponse.json({ ok: true, ignored: true, type: type ?? "unknown" });
}

export async function GET() {
  return NextResponse.json({
    service: "echo-receptionist",
    endpoint: "/api/vapi-webhook",
    listensFor: ["end-of-call-report", "hang", "status-update"],
  });
}

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = body.name ?? "Website Lead";
  const phone = body.phone;

  if (!phone) {
    return NextResponse.json({ error: "phone is required" }, { status: 400 });
  }

  if (!process.env.VAPI_API_KEY || !process.env.VAPI_PHONE_NUMBER_ID) {
    return NextResponse.json({
      ok: true,
      queued: false,
      mode: "demo",
      message: `Outbound call to ${name} at ${phone} would be placed via Vapi + Twilio.`,
    });
  }

  const response = await fetch("https://api.vapi.ai/call", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
      customer: { number: phone, name },
      assistantId: process.env.VAPI_ASSISTANT_ID,
    }),
  });

  const data = await response.json();
  return NextResponse.json({ ok: response.ok, queued: response.ok, data });
}

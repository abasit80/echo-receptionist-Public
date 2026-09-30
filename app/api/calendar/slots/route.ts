import { NextResponse } from "next/server";
import { formatSlotLabel, getAvailableSlots } from "@/lib/calendar/slots";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const slots = getAvailableSlots(date ? new Date(date) : new Date());

  return NextResponse.json({
    provider: process.env.GOOGLE_CALENDAR_ID ? "google_calendar" : "mock",
    timezone: "America/Los_Angeles",
    slots: slots.map((slot) => ({
      ...slot,
      label: formatSlotLabel(slot.start),
    })),
  });
}

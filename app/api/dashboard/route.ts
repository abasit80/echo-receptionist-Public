import { NextResponse } from "next/server";
import { listCalls } from "@/lib/data/call-store";
import { listLeads } from "@/lib/data/lead-store";
import { listAppointments } from "@/lib/data/appointment-store";
import { computeStats } from "@/lib/data/stats";
import { formatSlotLabel, getAvailableSlots } from "@/lib/calendar/slots";

export async function GET() {
  const [calls, leads, appointments] = await Promise.all([
    listCalls(),
    listLeads(),
    listAppointments(),
  ]);
  const slots = getAvailableSlots().slice(0, 4).map((slot) => ({
    ...slot,
    label: formatSlotLabel(slot.start),
  }));
  return NextResponse.json({
    calls,
    leads,
    appointments,
    slots,
    stats: computeStats(calls, leads),
  });
}

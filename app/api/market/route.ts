import { NextResponse } from "next/server";
import { formatSlotLabel, getAvailableSlots } from "@/lib/calendar/slots";
import { MARKET } from "@/lib/data/market";

export async function GET() {
  const slots = getAvailableSlots().slice(0, 4).map((slot) => ({
    ...slot,
    label: formatSlotLabel(slot.start),
  }));

  return NextResponse.json({
    asOf: new Date().toISOString(),
    timezone: "America/Los_Angeles",
    calendar: {
      provider: process.env.GOOGLE_CALENDAR_ID ? "google_calendar" : "mock",
      calendarId: "primary",
      slots,
    },
    market: {
      home: {
        business: MARKET.home.name,
        zips: MARKET.home.zips,
        outOfArea: MARKET.home.outOfArea,
        diagnosticFee: MARKET.home.diagnosticFee,
        quote: `${MARKET.home.quoteProduct} ${MARKET.home.quoteRange}`,
      },
      dental: {
        business: MARKET.dental.name,
        accepted: MARKET.dental.accepted,
        declined: MARKET.dental.declined,
      },
      medspa: {
        business: MARKET.medspa.name,
        menu: MARKET.medspa.menu,
      },
      legal: {
        business: MARKET.legal.name,
        matters: MARKET.legal.matters,
      },
      realty: {
        business: MARKET.realty.name,
        listing: MARKET.realty.listing,
        status: MARKET.realty.listingStatus,
      },
    },
  });
}

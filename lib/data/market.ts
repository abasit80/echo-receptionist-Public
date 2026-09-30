/** Market facts used by the playbook, agent KB, and dashboard pulse. */
export const MARKET = {
  timezone: "America/Los_Angeles",
  home: {
    name: "Hale HVAC",
    area: "SoMa / Mission Bay, San Francisco",
    zips: ["94103", "94107", "94110"],
    outOfArea: ["94121"],
    diagnosticFee: 189,
    quoteProduct: "Carrier 96% AFUE gas furnace",
    quoteRange: "$8,400–$11,200 installed",
    emergencyWindow: "4:10–6:10 PM PT same-day P1",
    ghlPipeline: "Home Services — Dispatch",
  },
  dental: {
    name: "Northline Dental",
    accepted: ["Delta Dental PPO"],
    declined: ["Medicaid", "Medicare"],
    newPatientMinutes: 45,
    ghlPipeline: "Dental — Hygiene",
  },
  medspa: {
    name: "Vista Medspa",
    menu: ["HydraFacial", "chemical peel", "neuromodulator consult"],
    consultMinutes: 45,
    prep: "Avoid alcohol and ibuprofen 24h before neuromodulator unless the clinician says otherwise.",
    ghlPipeline: "Medspa — Consults",
  },
  legal: {
    name: "Brooks & Klein LLP",
    matters: ["personal injury", "family / custody", "business"],
    consultMinutes: 30,
    ghlPipeline: "Legal — Intake",
  },
  realty: {
    name: "Harbor Street Realty",
    listing: "420 Market Street, Suite 300, San Francisco, CA 94111",
    listingStatus: "Active",
    tourMinutes: 20,
    ghlPipeline: "Realty — Showings",
  },
} as const;

export const MARKET_KNOWLEDGE_BASE = `Timezone: America/Los_Angeles
Office hours: Monday–Friday 9:00 AM–5:00 PM PT. Saturday partner coverage by request. Closed Sunday.

Hale HVAC (home services)
- Service ZIPs: 94103 (SoMa), 94107 (Potrero / Mission Bay), 94110 (Mission). Not 94121 (Richmond).
- Diagnostic: $189. Emergency P1 (no-heat / no-cool / burst pipe) transfers to dispatch.
- Replacement quote on file: Carrier 96% AFUE gas furnace $8,400–$11,200 installed. Do not invent other prices.

Northline Dental
- Accepts Delta Dental PPO. Does not accept Medicaid or Medicare.
- New-patient exam + cleaning: 45 minutes. Cancellations require 24 hours.
- Acute pain, swelling, or trauma: transfer to the on-call dentist. Do not book over an emergency.

Vista Medspa
- Menu: HydraFacial, chemical peel, neuromodulator (Botox) consult. Never quote a price that is not listed.
- Consults are 45 minutes. Prep: no alcohol or ibuprofen 24 hours before neuromodulator unless the clinician says otherwise.

Brooks & Klein LLP
- Screen matter type: personal injury, family/custody, or business. Conflict check before booking.
- Consults are 30 minutes. Transfer when the caller asks for counsel.

Harbor Street Realty
- Active listing: 420 Market Street, Suite 300, San Francisco, CA 94111. 20-minute tours.
- Hot buyers who want to see it today: transfer to the listing agent.`;

export function coverageLine() {
  return `${MARKET.home.zips.join(", ")} in coverage · ${MARKET.home.outOfArea.join(", ")} out of area`;
}

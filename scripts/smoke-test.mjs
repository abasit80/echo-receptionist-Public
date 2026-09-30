const base = process.env.SMOKE_BASE ?? "http://localhost:3003";

const pages = ["/", "/calls", "/pipeline", "/agent", "/integrations", "/settings/vapi"];

const results = [];
for (const path of pages) {
  const res = await fetch(`${base}${path}`);
  results.push(`${path} ${res.status}`);
}

const health = await fetch(`${base}/api/vapi-webhook`);
const webhook = await fetch(`${base}/api/vapi-webhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: {
      type: "end-of-call-report",
      call: {
        id: "vapi_test_1",
        customer: { name: "Alex Rivera", number: "+14155550199" },
        startedAt: "2026-09-04T20:00:00.000Z",
        endedAt: "2026-09-04T20:04:00.000Z",
      },
      transcript:
        "Agent: How can I help? Caller: I want to book Tuesday, this is urgent.",
      summary:
        "Qualified caller. Appointment booked for Tuesday. Urgent consult requested.",
      durationMs: 240000,
      analysis: { structuredData: { appointmentBooked: true } },
    },
  }),
});

const crm = await fetch(`${base}/api/crm/mock`);
const slots = await fetch(`${base}/api/calendar/slots`);

console.log(results.join("\n"));
console.log("webhook GET", health.status, await health.text());
console.log("webhook POST", webhook.status, await webhook.text());
console.log("crm", crm.status, await crm.text());
console.log("slots", slots.status, await slots.text());

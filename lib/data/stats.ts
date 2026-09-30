import type { CallRecord, DashboardStats, Lead, Sentiment } from "@/lib/types";

const sentimentScore: Record<Sentiment, number> = {
  positive: 92,
  urgent: 68,
  neutral: 56,
  negative: 28,
};

export function computeStats(calls: CallRecord[], leads: Lead[]): DashboardStats {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const callsToday = calls.filter((call) => new Date(call.started_at) >= startOfDay);
  const synced = calls.filter((call) => call.crm_status === "synced").length;
  const scored = calls.filter((call) => call.sentiment);
  const avgSentimentScore = scored.length
    ? Math.round(
        scored.reduce((sum, call) => sum + sentimentScore[call.sentiment as Sentiment], 0) /
          scored.length
      )
    : 0;

  return {
    activeCalls: calls.filter((call) => call.status === "in_progress").length,
    callsToday: callsToday.length,
    qualifiedLeads: leads.filter((lead) => ["qualified", "booked"].includes(lead.stage)).length,
    bookedAppointments: leads.filter((lead) => lead.stage === "booked").length,
    avgSentimentScore,
    crmSyncRate: calls.length ? Math.round((synced / calls.length) * 100) : 0,
  };
}

export function filterByIndustry<T extends { industry?: string }>(
  items: T[],
  industry?: string
) {
  if (!industry) return items;
  return items.filter((item) => !item.industry || item.industry === industry);
}

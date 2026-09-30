import { MissionControl } from "@/components/dashboard/mission-control";
import { getCalls, getDashboardStats, getLeads } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

export default async function MissionControlPage() {
  const [calls, leads] = await Promise.all([getCalls(), getLeads()]);
  const stats = await getDashboardStats(calls, leads);

  return <MissionControl calls={calls} leads={leads} stats={stats} />;
}

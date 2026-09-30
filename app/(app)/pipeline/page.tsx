import { LeadPipeline } from "@/components/dashboard/lead-pipeline";
import { getLeads } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const leads = await getLeads();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
          Revenue
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Lead pipeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visual board of callers Echo qualified, booked, or transferred.
        </p>
      </div>
      <LeadPipeline leads={leads} />
    </div>
  );
}

import { CallLog } from "@/components/dashboard/call-log";
import { getCalls } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

export default async function CallsPage() {
  const calls = await getCalls();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
          Operations
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Call logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every inbound and outbound conversation with AI summary and CRM write-back status.
        </p>
      </div>
      <CallLog calls={calls} />
    </div>
  );
}

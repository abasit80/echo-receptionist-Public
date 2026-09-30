import { IntegrationBoard } from "@/components/integrations/integration-board";
import { getIntegrations } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams?: { connect?: string };
}) {
  const integrations = await getIntegrations();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
          Connectivity
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect Vapi, Twilio, GoHighLevel, and Google Calendar. Test writes to CRM, SMS, and slots.
        </p>
      </div>
      <IntegrationBoard integrations={integrations} focus={searchParams?.connect} />
    </div>
  );
}

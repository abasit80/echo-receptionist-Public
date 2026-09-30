import { VapiConfigForm } from "@/components/vapi/vapi-config-form";
import { getVapiConfig } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

export default async function VapiSettingsPage() {
  const config = await getVapiConfig();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
          Voice stack
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Vapi configuration</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect API keys and customize the greeting Echo uses on every inbound and outbound line.
        </p>
      </div>
      <VapiConfigForm config={config} />
    </div>
  );
}

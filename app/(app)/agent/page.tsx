import { AgentBuilder } from "@/components/agent/agent-builder";
import { getIntegrations, getVapiConfig } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

export default async function AgentPage() {
  const [config, integrations] = await Promise.all([
    getVapiConfig(),
    getIntegrations(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
          Agent studio
        </p>
        <h1 className="mt-1 text-2xl font-semibold">AI agent builder</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tune knowledge, greeting, and the systems Echo can act on during a live call.
        </p>
      </div>
      <AgentBuilder config={config} integrations={integrations} />
    </div>
  );
}

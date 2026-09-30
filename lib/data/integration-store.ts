import { exec, queryAll } from "@/lib/db/mysql";
import { DEMO_ORG_ID } from "@/lib/data/demo";
import type { IntegrationProvider, IntegrationSetting } from "@/lib/types";

type IntegrationRow = Omit<IntegrationSetting, "enabled" | "config"> & {
  enabled: number;
  config: string;
};

function mapIntegration(row: IntegrationRow): IntegrationSetting {
  let config: Record<string, string> = {};
  try {
    config = JSON.parse(row.config || "{}");
  } catch {
    config = {};
  }
  return {
    ...row,
    enabled: Boolean(row.enabled),
    config,
  };
}

export async function listIntegrations(): Promise<IntegrationSetting[]> {
  const rows = await queryAll<IntegrationRow>("SELECT * FROM integrations ORDER BY provider");
  return rows.map(mapIntegration);
}

export async function upsertIntegration(
  provider: IntegrationProvider,
  patch: Partial<Pick<IntegrationSetting, "enabled" | "config">>
) {
  const current = (await listIntegrations()).find((item) => item.provider === provider);
  const updated: IntegrationSetting = {
    id: current?.id ?? `int_${provider}`,
    org_id: current?.org_id ?? DEMO_ORG_ID,
    provider,
    enabled: patch.enabled ?? current?.enabled ?? true,
    config: { ...(current?.config ?? {}), ...(patch.config ?? {}) },
    updated_at: new Date().toISOString(),
  };

  await exec(
    `INSERT INTO integrations (id, org_id, provider, enabled, config, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       enabled = VALUES(enabled),
       config = VALUES(config),
       updated_at = VALUES(updated_at)`,
    [
      updated.id,
      updated.org_id,
      updated.provider,
      updated.enabled ? 1 : 0,
      JSON.stringify(updated.config),
      updated.updated_at,
    ]
  );

  return updated;
}

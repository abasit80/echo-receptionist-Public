import { exec, queryOne } from "@/lib/db/mysql";
import { DEMO_ORG_ID, demoVapiConfig } from "@/lib/data/demo";
import type { VapiConfiguration } from "@/lib/types";

export async function getVapiConfigRecord(): Promise<VapiConfiguration> {
  const row = await queryOne<VapiConfiguration>(
    "SELECT * FROM vapi_configurations WHERE org_id = ? LIMIT 1",
    [DEMO_ORG_ID]
  );
  return row ?? demoVapiConfig;
}

export async function upsertVapiConfig(patch: Partial<VapiConfiguration>) {
  const current = await getVapiConfigRecord();
  const updated: VapiConfiguration = {
    ...current,
    ...patch,
    org_id: current.org_id,
    id: current.id,
    updated_at: new Date().toISOString(),
  };

  await exec(
    `INSERT INTO vapi_configurations (
      id, org_id, vapi_api_key, vapi_public_key, assistant_id, phone_number_id,
      greeting, system_instructions, knowledge_base, voice_id, first_message, model, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      vapi_api_key = VALUES(vapi_api_key),
      vapi_public_key = VALUES(vapi_public_key),
      assistant_id = VALUES(assistant_id),
      phone_number_id = VALUES(phone_number_id),
      greeting = VALUES(greeting),
      system_instructions = VALUES(system_instructions),
      knowledge_base = VALUES(knowledge_base),
      voice_id = VALUES(voice_id),
      first_message = VALUES(first_message),
      model = VALUES(model),
      updated_at = VALUES(updated_at)`,
    [
      updated.id,
      updated.org_id,
      updated.vapi_api_key,
      updated.vapi_public_key,
      updated.assistant_id,
      updated.phone_number_id,
      updated.greeting,
      updated.system_instructions,
      updated.knowledge_base,
      updated.voice_id,
      updated.first_message,
      updated.model,
      updated.updated_at,
    ]
  );

  return updated;
}

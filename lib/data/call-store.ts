import { exec, queryAll, queryOne } from "@/lib/db/mysql";
import type { CallRecord } from "@/lib/types";

type CallRow = Omit<CallRecord, "tags"> & { tags: string };

function mapCall(row: CallRow): CallRecord {
  let tags: string[] = [];
  try {
    tags = JSON.parse(row.tags || "[]");
  } catch {
    tags = [];
  }
  return {
    ...row,
    tags,
    sentiment: row.sentiment ?? null,
    vapi_call_id: row.vapi_call_id ?? null,
    ai_summary: row.ai_summary ?? null,
    transcript: row.transcript ?? null,
    crm_contact_id: row.crm_contact_id ?? null,
    ended_at: row.ended_at ?? null,
  };
}

export async function listCalls(): Promise<CallRecord[]> {
  const rows = await queryAll<CallRow>("SELECT * FROM calls ORDER BY started_at DESC");
  return rows.map(mapCall);
}

export async function getCall(id: string): Promise<CallRecord | null> {
  const row = await queryOne<CallRow>("SELECT * FROM calls WHERE id = ?", [id]);
  return row ? mapCall(row) : null;
}

export async function upsertCall(call: CallRecord) {
  await exec(
    `INSERT INTO calls (
      id, org_id, vapi_call_id, direction, caller_name, caller_phone, status, sentiment,
      duration_seconds, ai_summary, transcript, crm_status, crm_contact_id, tags, industry,
      started_at, ended_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      vapi_call_id = VALUES(vapi_call_id),
      direction = VALUES(direction),
      caller_name = VALUES(caller_name),
      caller_phone = VALUES(caller_phone),
      status = VALUES(status),
      sentiment = VALUES(sentiment),
      duration_seconds = VALUES(duration_seconds),
      ai_summary = VALUES(ai_summary),
      transcript = VALUES(transcript),
      crm_status = VALUES(crm_status),
      crm_contact_id = VALUES(crm_contact_id),
      tags = VALUES(tags),
      industry = VALUES(industry),
      started_at = VALUES(started_at),
      ended_at = VALUES(ended_at)`,
    [
      call.id,
      call.org_id,
      call.vapi_call_id,
      call.direction,
      call.caller_name,
      call.caller_phone,
      call.status,
      call.sentiment,
      call.duration_seconds,
      call.ai_summary,
      call.transcript,
      call.crm_status,
      call.crm_contact_id,
      JSON.stringify(call.tags ?? []),
      call.industry ?? null,
      call.started_at,
      call.ended_at,
      call.created_at,
    ]
  );
  return call;
}

export async function updateCall(id: string, patch: Partial<CallRecord>) {
  const current = await getCall(id);
  if (!current) return null;
  const updated = { ...current, ...patch };
  await upsertCall(updated);
  return updated;
}

import { exec, queryAll, queryOne } from "@/lib/db/mysql";
import type { Lead } from "@/lib/types";

export async function listLeads(): Promise<Lead[]> {
  return queryAll<Lead>("SELECT * FROM leads ORDER BY updated_at DESC");
}

export async function upsertLead(lead: Lead) {
  await exec(
    `INSERT INTO leads (
      id, org_id, call_id, name, phone, email, stage, source, score, notes, industry, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      call_id = VALUES(call_id),
      name = VALUES(name),
      phone = VALUES(phone),
      email = VALUES(email),
      stage = VALUES(stage),
      source = VALUES(source),
      score = VALUES(score),
      notes = VALUES(notes),
      industry = VALUES(industry),
      updated_at = VALUES(updated_at)`,
    [
      lead.id,
      lead.org_id,
      lead.call_id,
      lead.name,
      lead.phone,
      lead.email,
      lead.stage,
      lead.source,
      lead.score,
      lead.notes,
      lead.industry ?? null,
      lead.created_at,
      lead.updated_at,
    ]
  );

  await exec("DELETE FROM leads WHERE phone = ? AND id != ?", [lead.phone, lead.id]);
  return lead;
}

export async function updateLead(id: string, patch: Partial<Lead>) {
  const current = (await queryOne<Lead>("SELECT * FROM leads WHERE id = ?", [id])) ?? null;
  if (!current) return null;
  const updated: Lead = { ...current, ...patch, updated_at: new Date().toISOString() };
  await upsertLead(updated);
  return updated;
}

import { exec, queryAll } from "@/lib/db/mysql";
import type { Appointment } from "@/lib/types";

export async function listAppointments(): Promise<Appointment[]> {
  return queryAll<Appointment>("SELECT * FROM appointments ORDER BY starts_at ASC");
}

export async function upsertAppointment(row: Appointment) {
  await exec(
    `INSERT INTO appointments (
      id, org_id, lead_id, call_id, starts_at, ends_at, calendar_event_id, confirmation_sent, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      lead_id = VALUES(lead_id),
      call_id = VALUES(call_id),
      starts_at = VALUES(starts_at),
      ends_at = VALUES(ends_at),
      calendar_event_id = VALUES(calendar_event_id),
      confirmation_sent = VALUES(confirmation_sent),
      status = VALUES(status)`,
    [
      row.id,
      row.org_id,
      row.lead_id,
      row.call_id,
      row.starts_at,
      row.ends_at,
      row.calendar_event_id,
      row.confirmation_sent ? 1 : 0,
      row.status,
      row.created_at,
    ]
  );
  return row;
}

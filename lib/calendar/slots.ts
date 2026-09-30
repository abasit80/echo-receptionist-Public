export interface CalendarSlot {
  start: string;
  end: string;
  available: boolean;
}

const PT = "America/Los_Angeles";

/** Next open holds on the primary Google Calendar (weekdays 9–5 PT, 45 min, skip 11 AM and 2 PM). */
export function getAvailableSlots(date = new Date()): CalendarSlot[] {
  const slots: CalendarSlot[] = [];

  for (let dayOffset = 0; dayOffset < 8 && slots.length < 6; dayOffset += 1) {
    const cursor = new Date(date);
    cursor.setDate(date.getDate() + dayOffset);
    if (cursor.getDay() === 0 || cursor.getDay() === 6) continue;

    cursor.setHours(9, 0, 0, 0);
    for (let index = 0; index < 8; index += 1) {
      if (index === 2 || index === 5) continue;
      const start = new Date(cursor.getTime() + index * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 45 * 60 * 1000);
      if (start <= date) continue;
      slots.push({
        start: start.toISOString(),
        end: end.toISOString(),
        available: true,
      });
      if (slots.length >= 6) break;
    }
  }

  return slots;
}

export function nextOpenSlot(date = new Date()) {
  return getAvailableSlots(date)[0] ?? null;
}

export function formatSlotLabel(iso: string, timeZone = PT) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });
}

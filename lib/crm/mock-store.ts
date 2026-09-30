import type { CrmSyncPayload } from "@/lib/types";

export interface MockCrmRecord extends CrmSyncPayload {
  contactId: string;
  receivedAt: string;
}

const globalStore = globalThis as typeof globalThis & {
  echoCrmInbox?: MockCrmRecord[];
};

if (!globalStore.echoCrmInbox) {
  globalStore.echoCrmInbox = [];
}

const inbox = globalStore.echoCrmInbox;

export function writeMockCrm(payload: CrmSyncPayload): MockCrmRecord {
  const record: MockCrmRecord = {
    ...payload,
    contactId: `ghl_${crypto.randomUUID().slice(0, 8)}`,
    receivedAt: new Date().toISOString(),
  };
  inbox.unshift(record);
  return record;
}

export function listMockCrm(limit = 20) {
  return { count: inbox.length, events: inbox.slice(0, limit) };
}

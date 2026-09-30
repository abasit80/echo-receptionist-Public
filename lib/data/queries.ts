import { listCalls } from "@/lib/data/call-store";
import { listLeads } from "@/lib/data/lead-store";
import { computeStats } from "@/lib/data/stats";
import { listIntegrations } from "@/lib/data/integration-store";
import { getVapiConfigRecord } from "@/lib/data/vapi-store";
import type {
  CallRecord,
  DashboardStats,
  IntegrationSetting,
  Lead,
  VapiConfiguration,
} from "@/lib/types";

export async function getCalls(): Promise<CallRecord[]> {
  return listCalls();
}

export async function getLeads(): Promise<Lead[]> {
  return listLeads();
}

export async function getVapiConfig(): Promise<VapiConfiguration> {
  return getVapiConfigRecord();
}

export async function getIntegrations(): Promise<IntegrationSetting[]> {
  return listIntegrations();
}

export async function getDashboardStats(
  calls: CallRecord[],
  leads: Lead[]
): Promise<DashboardStats> {
  return computeStats(calls, leads);
}

export type CallStatus =
  | "in_progress"
  | "completed"
  | "scheduled"
  | "transferred"
  | "missed";

export type CallDirection = "inbound" | "outbound";

export type Sentiment = "positive" | "neutral" | "negative" | "urgent";

export type CrmStatus = "pending" | "synced" | "failed";

export type LeadStage =
  | "new"
  | "contacted"
  | "qualified"
  | "booked"
  | "transferred"
  | "lost";

export type IntegrationProvider = "ghl" | "twilio" | "google_calendar" | "openai";

export interface CallRecord {
  id: string;
  org_id: string;
  vapi_call_id: string | null;
  direction: CallDirection;
  caller_name: string;
  caller_phone: string;
  status: CallStatus;
  sentiment: Sentiment | null;
  duration_seconds: number;
  ai_summary: string | null;
  transcript: string | null;
  crm_status: CrmStatus;
  crm_contact_id: string | null;
  tags: string[];
  industry?: string;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  org_id: string;
  call_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  stage: LeadStage;
  source: string;
  score: number;
  notes: string | null;
  industry?: string;
  created_at: string;
  updated_at: string;
}

export interface VapiConfiguration {
  id: string;
  org_id: string;
  vapi_api_key: string;
  vapi_public_key: string;
  assistant_id: string;
  phone_number_id: string;
  greeting: string;
  system_instructions: string;
  knowledge_base: string;
  voice_id: string;
  first_message: string;
  model: string;
  updated_at: string;
}

export interface IntegrationSetting {
  id: string;
  org_id: string;
  provider: IntegrationProvider;
  enabled: boolean;
  config: Record<string, string>;
  updated_at: string;
}

export interface Appointment {
  id: string;
  org_id: string;
  lead_id: string | null;
  call_id: string | null;
  starts_at: string;
  ends_at: string;
  calendar_event_id: string | null;
  confirmation_sent: boolean | number;
  status: string;
  created_at: string;
}

export interface DashboardStats {
  activeCalls: number;
  callsToday: number;
  qualifiedLeads: number;
  bookedAppointments: number;
  avgSentimentScore: number;
  crmSyncRate: number;
}

export interface CrmSyncPayload {
  contact: {
    name: string;
    phone: string;
    email?: string | null;
  };
  call: {
    id: string;
    vapiCallId?: string | null;
    durationSeconds: number;
    sentiment?: Sentiment | null;
    tags: string[];
  };
  transcript: string | null;
  summary: string | null;
  notes: string;
  tags: string[];
}

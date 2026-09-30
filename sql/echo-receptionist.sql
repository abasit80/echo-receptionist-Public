-- Echo Receptionist AI
-- MySQL database: echoreceptionist

CREATE TABLE IF NOT EXISTS organizations (
  id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(191) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY organizations_slug_idx (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) NOT NULL,
  org_id VARCHAR(64) NOT NULL,
  email VARCHAR(191) NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'admin',
  created_at VARCHAR(40) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_idx (email),
  CONSTRAINT users_org_fk FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vapi_configurations (
  id VARCHAR(64) NOT NULL,
  org_id VARCHAR(64) NOT NULL,
  vapi_api_key TEXT NOT NULL,
  vapi_public_key TEXT NOT NULL,
  assistant_id VARCHAR(128) NOT NULL DEFAULT '',
  phone_number_id VARCHAR(128) NOT NULL DEFAULT '',
  greeting TEXT NOT NULL,
  system_instructions TEXT NOT NULL,
  knowledge_base TEXT NOT NULL,
  voice_id VARCHAR(64) NOT NULL DEFAULT 'paige',
  first_message TEXT NOT NULL,
  model VARCHAR(64) NOT NULL DEFAULT 'gpt-4o',
  updated_at VARCHAR(40) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY vapi_org_idx (org_id),
  CONSTRAINT vapi_org_fk FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS integrations (
  id VARCHAR(64) NOT NULL,
  org_id VARCHAR(64) NOT NULL,
  provider VARCHAR(32) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 0,
  config TEXT NOT NULL,
  updated_at VARCHAR(40) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY integrations_org_provider_idx (org_id, provider),
  CONSTRAINT integrations_org_fk FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS calls (
  id VARCHAR(64) NOT NULL,
  org_id VARCHAR(64) NOT NULL,
  vapi_call_id VARCHAR(128) NULL,
  direction VARCHAR(16) NOT NULL,
  caller_name VARCHAR(255) NOT NULL,
  caller_phone VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL,
  sentiment VARCHAR(32) NULL,
  duration_seconds INT NOT NULL DEFAULT 0,
  ai_summary TEXT NULL,
  transcript MEDIUMTEXT NULL,
  crm_status VARCHAR(16) NOT NULL DEFAULT 'pending',
  crm_contact_id VARCHAR(128) NULL,
  tags TEXT NOT NULL,
  industry VARCHAR(64) NULL,
  started_at VARCHAR(40) NOT NULL,
  ended_at VARCHAR(40) NULL,
  created_at VARCHAR(40) NOT NULL,
  PRIMARY KEY (id),
  KEY calls_started_at_idx (started_at),
  KEY calls_org_status_idx (org_id, status),
  CONSTRAINT calls_org_fk FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id VARCHAR(64) NOT NULL,
  org_id VARCHAR(64) NOT NULL,
  call_id VARCHAR(64) NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  email VARCHAR(191) NULL,
  stage VARCHAR(32) NOT NULL,
  source VARCHAR(64) NOT NULL DEFAULT 'Inbound Voice',
  score INT NOT NULL DEFAULT 50,
  notes TEXT NULL,
  industry VARCHAR(64) NULL,
  created_at VARCHAR(40) NOT NULL,
  updated_at VARCHAR(40) NOT NULL,
  PRIMARY KEY (id),
  KEY leads_stage_idx (stage),
  KEY leads_org_phone_idx (org_id, phone),
  CONSTRAINT leads_org_fk FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE,
  CONSTRAINT leads_call_fk FOREIGN KEY (call_id) REFERENCES calls (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(64) NOT NULL,
  org_id VARCHAR(64) NOT NULL,
  lead_id VARCHAR(64) NULL,
  call_id VARCHAR(64) NULL,
  starts_at VARCHAR(40) NOT NULL,
  ends_at VARCHAR(40) NOT NULL,
  calendar_event_id VARCHAR(128) NULL,
  confirmation_sent TINYINT(1) NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'confirmed',
  created_at VARCHAR(40) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT appointments_org_fk FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE,
  CONSTRAINT appointments_lead_fk FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE SET NULL,
  CONSTRAINT appointments_call_fk FOREIGN KEY (call_id) REFERENCES calls (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO organizations (id, name, slug, created_at)
VALUES ('org_echo_demo', 'Echo Receptionist Demo', 'echo-demo', DATE_FORMAT(UTC_TIMESTAMP(3), '%Y-%m-%dT%H:%i:%s.000Z'));

INSERT IGNORE INTO vapi_configurations (
  id, org_id, vapi_api_key, vapi_public_key, assistant_id, phone_number_id,
  greeting, system_instructions, knowledge_base, voice_id, first_message, model, updated_at
) VALUES (
  'vapi_cfg_demo',
  'org_echo_demo',
  '',
  '',
  '',
  '',
  'Thank you for calling {{business_name}}. This is Echo, your virtual receptionist. How can I help you today?',
  'You are Echo, a professional AI receptionist. Qualify the caller, capture name and callback number, answer FAQ from the knowledge base, and offer to book an appointment when intent is clear. Never invent availability. If the caller is upset or asks for a person, transfer immediately.',
  'Office hours: Monday–Friday 9:00 AM to 5:00 PM.
We do not accept Medicaid or Medicare.
New patient visits are 45 minutes.
Cancellations require 24 hours notice.
Address: 420 Market Street, Suite 300.',
  'paige',
  'Hi, you’ve reached the front desk. I’m Echo — I can book appointments, answer common questions, or connect you with the team.',
  'gpt-4o',
  DATE_FORMAT(UTC_TIMESTAMP(3), '%Y-%m-%dT%H:%i:%s.000Z')
);

INSERT IGNORE INTO calls (
  id, org_id, vapi_call_id, direction, caller_name, caller_phone, status, sentiment,
  duration_seconds, ai_summary, transcript, crm_status, crm_contact_id, tags, industry,
  started_at, ended_at, created_at
) VALUES
(
  'call_1001', 'org_echo_demo', 'vapi_8f2a1c', 'inbound', 'Maya Chen', '+14155550182',
  'in_progress', 'urgent', 94,
  'Caller needs a same-day consult after a missed insurance denial.',
  NULL, 'pending', NULL, '["urgent","new-patient"]', 'dental',
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 94 SECOND, '%Y-%m-%dT%H:%i:%s.000Z'),
  NULL,
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 94 SECOND, '%Y-%m-%dT%H:%i:%s.000Z')
),
(
  'call_1002', 'org_echo_demo', 'vapi_3b91de', 'inbound', 'James Ortega', '+12125550119',
  'scheduled', 'positive', 246,
  'Qualified homeowner. Booked a 30-minute discovery call for Tuesday 10:00 AM.',
  'Agent: Thanks for calling Northline Dental. How can I help today?
Caller: I need a cleaning and a consult for a cracked tooth.
Agent: I can get you in Tuesday at 10. Does that work?
Caller: Perfect.',
  'synced', 'ghl_cnt_8821', '["qualified","booked"]', 'home',
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 1 HOUR, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 56 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 1 HOUR, '%Y-%m-%dT%H:%i:%s.000Z')
),
(
  'call_1003', 'org_echo_demo', 'vapi_aa12f0', 'outbound', 'Priya Shah', '+13105550144',
  'completed', 'positive', 188,
  'Follow-up after website form. Confirmed interest in premium package and requested pricing SMS.',
  NULL, 'synced', 'ghl_cnt_7740', '["outbound","qualified"]', 'medspa',
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 2 HOUR, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 117 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 2 HOUR, '%Y-%m-%dT%H:%i:%s.000Z')
),
(
  'call_1004', 'org_echo_demo', 'vapi_c91e33', 'inbound', 'Daniel Brooks', '+16175550103',
  'transferred', 'negative', 312,
  'Existing patient frustrated about a billing error. Escalated to human receptionist.',
  NULL, 'synced', 'ghl_cnt_2290', '["billing","escalated"]', 'legal',
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 3 HOUR, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 155 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 3 HOUR, '%Y-%m-%dT%H:%i:%s.000Z')
),
(
  'call_1005', 'org_echo_demo', 'vapi_77d0ab', 'inbound', 'Sofia Alvarez', '+13035550177',
  'completed', 'neutral', 141,
  'Asked about office hours and insurance. Informed we do not accept Medicaid; offered cash-pay options.',
  NULL, 'pending', NULL, '["info-request"]', 'dental',
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 5 HOUR, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 298 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 5 HOUR, '%Y-%m-%dT%H:%i:%s.000Z')
),
(
  'call_1006', 'org_echo_demo', 'vapi_e4c118', 'inbound', 'Unknown Caller', '+12065550190',
  'missed', NULL, 8,
  'Caller disconnected before qualification completed.',
  NULL, 'failed', NULL, '["abandoned"]', 'realty',
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 7 HOUR, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 419 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 7 HOUR, '%Y-%m-%dT%H:%i:%s.000Z')
);

INSERT IGNORE INTO leads (
  id, org_id, call_id, name, phone, email, stage, source, score, notes, industry, created_at, updated_at
) VALUES
(
  'lead_01', 'org_echo_demo', 'call_1002', 'James Ortega', '+12125550119',
  'james.ortega@example.com', 'booked', 'Inbound Voice', 92,
  'Tuesday 10:00 AM consult confirmed.', 'home',
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 1 HOUR, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 56 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z')
),
(
  'lead_02', 'org_echo_demo', 'call_1003', 'Priya Shah', '+13105550144',
  'priya.shah@example.com', 'qualified', 'Website Form', 84,
  'Requested premium package pricing via SMS.', 'medspa',
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 2 HOUR, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 117 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z')
),
(
  'lead_03', 'org_echo_demo', 'call_1001', 'Maya Chen', '+14155550182',
  NULL, 'new', 'Inbound Voice', 76,
  'Live call — same-day consult requested.', 'dental',
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 94 SECOND, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 94 SECOND, '%Y-%m-%dT%H:%i:%s.000Z')
),
(
  'lead_04', 'org_echo_demo', 'call_1005', 'Sofia Alvarez', '+13035550177',
  'sofia.a@example.com', 'contacted', 'Inbound Voice', 61,
  'Insurance question. Follow up with cash-pay sheet.', 'dental',
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 5 HOUR, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 298 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z')
),
(
  'lead_05', 'org_echo_demo', 'call_1004', 'Daniel Brooks', '+16175550103',
  'dbrooks@example.com', 'transferred', 'Existing Patient', 48,
  'Billing dispute transferred to front desk.', 'legal',
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 3 HOUR, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 155 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z')
),
(
  'lead_06', 'org_echo_demo', NULL, 'Elena Rossi', '+17025550128',
  'elena.rossi@example.com', 'qualified', 'Website Form', 88,
  'Outbound call queued after form submit.', 'realty',
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 11 HOUR, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 10 HOUR, '%Y-%m-%dT%H:%i:%s.000Z')
);

INSERT IGNORE INTO integrations (id, org_id, provider, enabled, config, updated_at) VALUES
('int_ghl', 'org_echo_demo', 'ghl', 1, '{"locationId":"","apiKey":""}', DATE_FORMAT(UTC_TIMESTAMP(3), '%Y-%m-%dT%H:%i:%s.000Z')),
('int_twilio', 'org_echo_demo', 'twilio', 1, '{"accountSid":"","fromNumber":""}', DATE_FORMAT(UTC_TIMESTAMP(3), '%Y-%m-%dT%H:%i:%s.000Z')),
('int_gcal', 'org_echo_demo', 'google_calendar', 1, '{"calendarId":"primary"}', DATE_FORMAT(UTC_TIMESTAMP(3), '%Y-%m-%dT%H:%i:%s.000Z')),
('int_openai', 'org_echo_demo', 'openai', 1, '{"model":"gpt-4o"}', DATE_FORMAT(UTC_TIMESTAMP(3), '%Y-%m-%dT%H:%i:%s.000Z'));

UPDATE calls
SET ai_summary = 'Northline Dental. Acute pain + swelling. Echo is on the line for a same-day Delta Dental PPO transfer.',
    tags = '["urgent","new-patient","delta-ppo"]',
    industry = 'dental'
WHERE id = 'call_1001';

UPDATE calls
SET ai_summary = 'Hale HVAC. Qualified homeowner in 94107. Booked a $189 furnace diagnostic on Google Calendar and synced GoHighLevel Home Services — Booked.',
    transcript = 'Echo: Thanks for calling Hale HVAC, this is Echo.\nCaller: Furnace is cutting out in SoMa, ZIP 94107.\nEcho: That is in coverage. I can hold the next $189 diagnostic window.\nCaller: Book it.',
    tags = '["qualified","booked","94107"]',
    industry = 'home'
WHERE id = 'call_1002';

UPDATE calls
SET ai_summary = 'Vista Medspa. Returning HydraFacial interest after website form. Twilio SMS offered for the menu; GoHighLevel Medspa — Consults.',
    tags = '["outbound","qualified","hydrafacial"]',
    industry = 'medspa'
WHERE id = 'call_1003';

UPDATE calls
SET ai_summary = 'Brooks & Klein LLP. Existing client billing dispute. Warm-transferred to intake; GoHighLevel Legal — Intake.',
    tags = '["billing","escalated"]',
    industry = 'legal'
WHERE id = 'call_1004';

UPDATE calls
SET ai_summary = 'Northline Dental. Delta Dental PPO is accepted; Medicaid and Medicare are not. Cash-pay sheet offered via SMS.',
    tags = '["info-request","delta-ppo"]',
    industry = 'dental'
WHERE id = 'call_1005';

UPDATE leads
SET notes = 'Hale HVAC · ZIP 94107 · $189 diagnostic held on Google Calendar. GHL pipeline Home Services — Booked.'
WHERE id = 'lead_01';

UPDATE leads
SET notes = 'Vista Medspa · HydraFacial / consult interest. Menu SMS requested. GHL Medspa — Consults.'
WHERE id = 'lead_02';

UPDATE leads
SET notes = 'Northline Dental · live call — same-day pain, Delta Dental PPO. Transfer in progress.'
WHERE id = 'lead_03';

UPDATE leads
SET notes = 'Northline Dental · Delta Dental PPO yes. Medicaid / Medicare no. Cash-pay sheet pending.'
WHERE id = 'lead_04';

UPDATE leads
SET notes = 'Brooks & Klein · billing dispute transferred to intake counsel.'
WHERE id = 'lead_05';

UPDATE leads
SET notes = 'Harbor Street Realty · 420 Market Street, Suite 300 (Active). Outbound showing follow-up queued.'
WHERE id = 'lead_06';

INSERT IGNORE INTO calls (
  id, org_id, vapi_call_id, direction, caller_name, caller_phone, status, sentiment,
  duration_seconds, ai_summary, transcript, crm_status, crm_contact_id, tags, industry,
  started_at, ended_at, created_at
) VALUES
(
  'call_1007', 'org_echo_demo', 'vapi_hvac_p1', 'inbound', 'Jordan Hale', '+14155550111',
  'transferred', 'urgent', 118,
  'Hale HVAC after-hours no-heat at ZIP 94107. P1 transfer to dispatch. GHL Home Services — Dispatch.',
  'Echo: Thanks for calling Hale HVAC, this is Echo.\nCaller: Furnace died. House is 54 degrees.\nEcho: That is a P1 no-heat. Transferring you to dispatch.',
  'synced', 'ghl_cnt_94107', '["dispatch","94107","P1"]', 'home',
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 25 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 23 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 25 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z')
),
(
  'call_1008', 'org_echo_demo', 'vapi_list_420', 'inbound', 'Ivy Chen', '+14155550173',
  'scheduled', 'positive', 164,
  'Harbor Street. 420 Market Street, Suite 300 is Active. 20-min tour held. GHL Realty — Showings.',
  'Echo: Which listing are you calling about?\nIvy: 420 Market Street, Suite 300.\nEcho: That listing is active. I can hold a 20-minute tour.',
  'synced', 'ghl_cnt_420m', '["showing","420-market"]', 'realty',
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 90 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 87 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 90 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z')
);

INSERT IGNORE INTO leads (
  id, org_id, call_id, name, phone, email, stage, source, score, notes, industry, created_at, updated_at
) VALUES
(
  'lead_07', 'org_echo_demo', 'call_1007', 'Jordan Hale', '+14155550111',
  'jordan.hale@halehvac.com', 'transferred', 'Inbound Voice', 74,
  'P1 no-heat · 94107 · Hale HVAC dispatch. GHL Home Services — Dispatch.', 'home',
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 25 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 23 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z')
),
(
  'lead_08', 'org_echo_demo', 'call_1008', 'Ivy Chen', '+14155550173',
  'ivy.chen@gmail.com', 'booked', 'Inbound Voice', 91,
  '420 Market Street, Suite 300 · Active · 20-min Google Calendar tour. GHL Realty — Showings.', 'realty',
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 90 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 87 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z')
);

INSERT IGNORE INTO appointments (
  id, org_id, lead_id, call_id, starts_at, ends_at, calendar_event_id, confirmation_sent, status, created_at
) VALUES
(
  'apt_1002', 'org_echo_demo', 'lead_01', 'call_1002',
  DATE_FORMAT(UTC_TIMESTAMP(3) + INTERVAL 18 HOUR, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) + INTERVAL 18 HOUR + INTERVAL 45 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z'),
  'gcal_hale_diag_1002', 1, 'confirmed',
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 56 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z')
),
(
  'apt_1008', 'org_echo_demo', 'lead_08', 'call_1008',
  DATE_FORMAT(UTC_TIMESTAMP(3) + INTERVAL 22 HOUR, '%Y-%m-%dT%H:%i:%s.000Z'),
  DATE_FORMAT(UTC_TIMESTAMP(3) + INTERVAL 22 HOUR + INTERVAL 20 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z'),
  'gcal_420_market_1008', 1, 'confirmed',
  DATE_FORMAT(UTC_TIMESTAMP(3) - INTERVAL 87 MINUTE, '%Y-%m-%dT%H:%i:%s.000Z')
);

UPDATE vapi_configurations
SET knowledge_base = 'Timezone: America/Los_Angeles
Office hours: Monday–Friday 9:00 AM–5:00 PM PT. Saturday partner coverage by request. Closed Sunday.

Hale HVAC (home services)
- Service ZIPs: 94103 (SoMa), 94107 (Potrero / Mission Bay), 94110 (Mission). Not 94121 (Richmond).
- Diagnostic: $189. Emergency P1 (no-heat / no-cool / burst pipe) transfers to dispatch.
- Replacement quote on file: Carrier 96% AFUE gas furnace $8,400–$11,200 installed. Do not invent other prices.

Northline Dental
- Accepts Delta Dental PPO. Does not accept Medicaid or Medicare.
- New-patient exam + cleaning: 45 minutes. Cancellations require 24 hours.
- Acute pain, swelling, or trauma: transfer to the on-call dentist. Do not book over an emergency.

Vista Medspa
- Menu: HydraFacial, chemical peel, neuromodulator (Botox) consult. Never quote a price that is not listed.
- Consults are 45 minutes. Prep: no alcohol or ibuprofen 24 hours before neuromodulator unless the clinician says otherwise.

Brooks & Klein LLP
- Screen matter type: personal injury, family/custody, or business. Conflict check before booking.
- Consults are 30 minutes. Transfer when the caller asks for counsel.

Harbor Street Realty
- Active listing: 420 Market Street, Suite 300, San Francisco, CA 94111. 20-minute tours.
- Hot buyers who want to see it today: transfer to the listing agent.'
WHERE id = 'vapi_cfg_demo' AND CHAR_LENGTH(knowledge_base) < 800;

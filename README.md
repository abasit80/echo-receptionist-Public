# EchoReceptionist

SaaS AI voice receptionist that answers inbound lines, qualifies leads, books Google Calendar, and writes transcripts back to CRM.

## Stack

- **Frontend:** Next.js 14 App Router, Tailwind CSS, shadcn/ui, Framer Motion
- **Database:** MySQL via `sql/echo-receptionist.sql` (`echoreceptionist`)
- **Auth:** HMAC cookie session; users stored in MySQL
- **Voice:** Vapi.ai + Twilio
- **Integrations:** GoHighLevel, Google Calendar, OpenAI GPT-4o

## Local development

```bash
npm install
copy .env.example .env.local
npm run db:init
npm run dev
```

The dashboard is **auth-gated**. Create an account at `/signup` or log in at `/login`. Without a session, `/dashboard` and the rest of the app redirect to login. Accounts are stored in the MySQL `users` table.

## Database

SQL: `sql/echo-receptionist.sql` (tables + demo data)  
Database: `echoreceptionist` on MySQL (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`)

On first start the app creates the database if needed, then runs this file: tables plus demo calls, leads, integrations, and Vapi config. Signup writes into `users`.

```bash
npm run db:init
```

## Core routes

| Route | Purpose |
| --- | --- |
| `/` | Marketing landing page |
| `/signup` | Create an account |
| `/login` | Sign in |
| `/demo` | Animated product walkthrough |
| `/dashboard` | Mission Control — stats header, live waveform, recent calls, pipeline |
| `/calls` | Full call log (AI Summary + CRM Status) |
| `/pipeline` | Qualified lead board |
| `/agent` | Knowledge base + integration toggles |
| `/settings/vapi` | API keys, greeting, instructions |
| `/api/vapi-webhook` | End-of-call processor → transcript + mock CRM |
| `/api/crm/mock` | Mock GHL write-back inbox |
| `/api/outbound/trigger` | Website-form outbound call kickoff |
| `/api/health` | SQLite status and table counts |

## Webhook contract

Point Vapi's Server URL to:

```
https://<your-domain>/api/vapi-webhook
```

On `end-of-call-report` Echo will:

1. Normalize transcript, summary, sentiment, and tags
2. Persist the call + lead in SQLite
3. POST transcript, summary, tags, and notes to the mock CRM endpoint
4. Queue an SMS confirmation when the call status is `scheduled`
# echo-receptionist-Public

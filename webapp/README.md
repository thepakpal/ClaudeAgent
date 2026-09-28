# Job Match Board (production app)

A standalone Next.js + Supabase app: a password-gated board that ranks job
listings against your resume profile, updates daily via Vercel Cron, and
lets you track Saved/Applied status. No LinkedIn scraping or automated
applications anywhere — LinkedIn's User Agreement prohibits both, so this
pulls from public, key-free job-board APIs (Remotive, RemoteOK) instead.
You review and apply yourself, one click at a time.

This is a separate, deployable sibling of the Claude Artifact version in
the repo root — use whichever you prefer; they don't share data.

## Quick deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fthepakpal%2FClaudeAgent%2Ftree%2Fclaude%2Flinkedin-job-agent-nknfwh&root-directory=webapp&project-name=job-match-board&env=SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,ADMIN_PASSWORD,SESSION_SECRET,CRON_SECRET&envDescription=Supabase%20keys%20come%20from%20Project%20Settings%20%E2%86%92%20API%3B%20pick%20your%20own%20ADMIN_PASSWORD%3B%20SESSION_SECRET%2FCRON_SECRET%20are%20any%20random%20strings&envLink=https%3A%2F%2Fgithub.com%2Fthepakpal%2FClaudeAgent%2Fblob%2Fclaude%2Flinkedin-job-agent-nknfwh%2Fwebapp%2FREADME.md)

This pre-fills the Vercel import with the right root directory (`webapp`)
and prompts for every required env var by name. You still need a Supabase
project first (step 1 below) to get two of those values.

## Stack

- **Next.js 14** (App Router, TypeScript) — `app/`, `components/`, `lib/`
- **Supabase** (Postgres) — the `jobs` and `sync_status` tables, accessed
  only server-side via the service role key
- **Vercel** — hosting + a daily Cron Job that hits `/api/sync`

## One-time setup

### 1. Supabase

1. Create a free project at https://supabase.com.
2. Open the SQL editor and run `supabase/schema.sql` from this folder.
3. Go to Project Settings → API and copy the **Project URL** and the
   **service_role** key (not the `anon` key — this app never uses it).

### 2. Environment variables

Copy `.env.example` to `.env.local` for local dev, and set the same keys in
Vercel (Project Settings → Environment Variables) for production:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — from step 1.
- `ADMIN_PASSWORD` — whatever password you want to sign in with.
- `SESSION_SECRET` — any random string (`openssl rand -hex 32`).
- `CRON_SECRET` — any random string. Vercel automatically sends it as
  `Authorization: Bearer $CRON_SECRET` when invoking your Cron Job, once
  this env var is set on the project — that's what authorizes the daily
  sync without exposing the endpoint publicly.

### 3. Deploy

```bash
cd webapp
npm install
```

Push this repo to GitHub (already done if you're using the same repo as
the Claude Artifact version), then in Vercel: **New Project → Import** this
repo, set the **Root Directory** to `webapp`, add the env vars above, and
deploy. `vercel.json` in this folder already declares the daily cron
(03:45 UTC) — Vercel picks it up automatically on deploy.

### 4. First run

The board is empty until the first sync runs. Either wait for the daily
cron, or trigger it manually once after deploying:

```bash
curl -X POST https://<your-app>.vercel.app/api/sync \
  -H "Authorization: Bearer <your CRON_SECRET>"
```

Then open the app URL and sign in with `ADMIN_PASSWORD`.

## Local development

```bash
cd webapp
npm install
npm run dev
```

Visit http://localhost:3000 — you'll be redirected to `/login`. Trigger a
local sync with your session cookie already set, or:

```bash
curl -X POST http://localhost:3000/api/sync -H "Authorization: Bearer <CRON_SECRET>"
```

## How matching works

`lib/profile.ts` holds your resume-derived profile (skills with weights,
target titles, locations). `lib/fetchJobs.ts` pulls raw listings;
`lib/scoreJobs.ts` filters by location and scores by weighted keyword
overlap. `app/api/sync/route.ts` runs both, upserts the top 30 into
Supabase (without touching rows you've marked Saved/Applied), and drops
stale "new" listings that fell out of the ranking. Edit `lib/profile.ts`
whenever your resume or target roles change — no redeploy of the schema
needed.

## Extending

- **Broader India coverage**: Remotive/RemoteOK lean remote-global. Add an
  `fetchAdzuna()` function to `lib/fetchJobs.ts` using a free Adzuna API
  key (https://developer.adzuna.com/) for deeper India/on-site coverage.
- **AI-drafted apply notes**: intentionally left out to avoid ongoing API
  costs. To add it later, create `app/api/draft/route.ts` that calls the
  Anthropic API with `ANTHROPIC_API_KEY`, given a job + `profile.resumeSummary`.

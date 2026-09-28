-- Run this in the Supabase SQL editor once, on a fresh project.

create table if not exists jobs (
  id text primary key,
  source text not null,
  external_id text not null,
  title text not null default '',
  company text not null default '',
  location text not null default '',
  url text not null default '',
  tags text[] not null default '{}',
  job_type text default '',
  published text,
  score integer not null default 0,
  matched_terms text[] not null default '{}',
  status text not null default 'new' check (status in ('new', 'saved', 'applied')),
  is_new boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists jobs_score_idx on jobs (score desc);

create table if not exists sync_status (
  id integer primary key default 1,
  last_synced timestamptz,
  total_candidates integer,
  total_shown integer,
  constraint sync_status_singleton check (id = 1)
);

insert into sync_status (id) values (1) on conflict (id) do nothing;

-- Service-role only access: the app never uses the anon key, so RLS with no
-- policies means nothing is reachable except through the server (service
-- role bypasses RLS). This protects the data even if the anon key ever leaks.
alter table jobs enable row level security;
alter table sync_status enable row level security;

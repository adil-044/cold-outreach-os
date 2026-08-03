-- Outreach OS — Supabase schema (optional upgrade from localStorage)
create extension if not exists "pgcrypto";

create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  name text default '',
  business text not null,
  industry text default '',
  email text default '',
  instagram text default '',
  linkedin text default '',
  twitter text default '',
  phone text default '',
  website text default '',
  city text default '',
  state text default '',
  source text default 'manual',
  status text default 'new',
  script_id text,
  campaign_id text,
  last_contacted timestamptz,
  follow_up_date timestamptz,
  notes text default '',
  disposition_id text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists scripts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  subject text default '',
  body text not null,
  variables text[] default '{}',
  folder text default 'Inbox',
  archived boolean default false,
  version int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null,
  status text default 'draft',
  script_id text,
  prospect_ids text[] default '{}',
  sent int default 0,
  replies int default 0,
  meetings int default 0,
  created_at timestamptz default now()
);

create table if not exists dispositions (
  id text primary key,
  name text not null,
  color text not null,
  icon text default 'circle',
  automation text,
  follow_up_delay_days int default 0
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  prospect_id text not null,
  type text not null,
  title text not null,
  detail text,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  prospect_id text,
  due_date timestamptz not null,
  priority text default 'medium',
  done boolean default false,
  created_at timestamptz default now()
);

create index if not exists prospects_business_idx on prospects (business);
create index if not exists activities_prospect_idx on activities (prospect_id);

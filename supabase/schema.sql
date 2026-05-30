-- X-Ample dashboard schema (Supabase/Postgres)
-- Apply in Supabase SQL editor (or migrations) before enabling the dashboard.

-- Legacy: Tebex/FiveM dashboard tables (no longer used by the marketing site; safe to drop if unused)
-- Users authenticated via Tebex/FiveM basket auth.
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  tebex_customer_id text not null,
  username text,
  email text,
  display_name text,
  discord_tag text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tebex_customer_id)
);

create index if not exists idx_users_tebex_customer_id on public.users (tebex_customer_id);

-- Purchases ingested via Tebex webhooks.
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  tebex_payment_id text not null,
  total numeric,
  currency text,
  created_at timestamptz not null default now(),
  raw_json jsonb,
  unique (tebex_payment_id)
);

create index if not exists idx_purchases_user_id on public.purchases (user_id);
create index if not exists idx_purchases_created_at on public.purchases (created_at desc);

create table if not exists public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases (id) on delete cascade,
  package_id text,
  name text,
  price numeric,
  currency text,
  quantity int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists idx_purchase_items_purchase_id on public.purchase_items (purchase_id);

-- Support tickets
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  subject text not null,
  status text not null default 'open', -- open|pending|closed
  priority text not null default 'normal', -- low|normal|high
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tickets_user_id on public.tickets (user_id);
create index if not exists idx_tickets_updated_at on public.tickets (updated_at desc);

create table if not exists public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  author_user_id uuid references public.users (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ticket_messages_ticket_id on public.ticket_messages (ticket_id, created_at);

-- Global system state (health + last-run markers)
create table if not exists public.system_state (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Vacancies (editable by dashboard admins)
create table if not exists public.vacancies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  location text,
  type text,
  salary text,
  body_mdx text not null,
  apply_url text,
  apply_email text,
  status text not null default 'draft', -- open|closed|draft
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vacancies_status on public.vacancies (status);
create index if not exists idx_vacancies_published_at on public.vacancies (published_at desc);

-- Team page (content admin): singleton intro + members
create table if not exists public.team_page (
  id int primary key default 1 check (id = 1),
  intro text not null default 'Meet the people behind X-Ample.',
  updated_at timestamptz not null default now()
);

insert into public.team_page (id, intro) values (1, 'Meet the people behind X-Ample.')
on conflict (id) do nothing;

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  bio text,
  avatar_url text,
  discord_url text,
  github_url text,
  twitter_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_team_members_sort on public.team_members (sort_order asc, updated_at desc);

-- Newsletter signup (stored in `waitlist` table for backwards compatibility)
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  unique (email)
);

create index if not exists idx_waitlist_created_at on public.waitlist (created_at desc);

-- Portfolio page (content admin)
create table if not exists public.portfolio_page (
  id int primary key default 1 check (id = 1),
  intro text not null default 'A curated view of Discord bots, websites, and web apps we''ve shipped.',
  updated_at timestamptz not null default now()
);

insert into public.portfolio_page (id, intro) values (1, 'A curated view of Discord bots, websites, and web apps we''ve shipped.')
on conflict (id) do nothing;

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text,
  image_url text,
  project_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_portfolio_items_sort on public.portfolio_items (sort_order asc, updated_at desc);


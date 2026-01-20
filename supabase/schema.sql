-- X-Ample dashboard schema (Supabase/Postgres)
-- Apply in Supabase SQL editor (or migrations) before enabling the dashboard.

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


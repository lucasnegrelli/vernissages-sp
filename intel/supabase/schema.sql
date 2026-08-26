-- Vernissages SP: Intel — schema Supabase (Postgres)
-- Rode isto uma vez no SQL Editor do projeto Supabase.

create extension if not exists "pgcrypto";

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'past_due', 'canceled')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  canceled_at timestamptz
);

create index if not exists idx_subscribers_status on subscribers (status);
create index if not exists idx_subscribers_stripe_subscription
  on subscribers (stripe_subscription_id);

create table if not exists newsletter_issues (
  id uuid primary key default gen_random_uuid(),
  issue_number bigserial,
  subject text not null,
  preview_text text not null,
  intro text not null,
  sections jsonb not null default '[]'::jsonb,
  market_read text not null,
  scheduled_for timestamptz not null,
  sent_at timestamptz
);

create index if not exists idx_newsletter_issues_pending
  on newsletter_issues (sent_at, scheduled_for);

-- Row Level Security: só o Service Role (usado pelas rotas de servidor)
-- acessa estas tabelas. Nenhuma policy de leitura pública é criada de
-- propósito — os dados de assinantes e o conteúdo pago não são públicos.
alter table subscribers enable row level security;
alter table newsletter_issues enable row level security;

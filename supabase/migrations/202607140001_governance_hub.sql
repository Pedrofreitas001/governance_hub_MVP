-- Governance Hub: execute in Supabase SQL Editor or via `supabase db push`.
-- Connector credentials are encrypted by the application before reaching this table.
create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  role text not null check (role in ('admin', 'steward', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  type text not null check (type in ('vtex', 'zendesk', 'powerbi', 'supabase', 'openrouter')),
  name text not null,
  status text not null default 'pending' check (status in ('pending', 'connected', 'error')),
  read_only boolean not null default true check (read_only),
  config jsonb not null default '{}'::jsonb,
  encrypted_secret text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target text not null,
  detail text,
  created_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.connections enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = target_workspace and m.user_id = auth.uid()
  );
$$;

create policy "members read workspaces" on public.workspaces for select using (public.is_workspace_member(id));
create policy "members read membership" on public.workspace_members for select using (public.is_workspace_member(workspace_id));
create policy "members read connections" on public.connections for select using (public.is_workspace_member(workspace_id));
create policy "members read audit logs" on public.audit_logs for select using (public.is_workspace_member(workspace_id));

-- Writes happen only through server routes using the service-role key after RBAC checks.

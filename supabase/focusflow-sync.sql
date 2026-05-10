-- FocusFlow cross-device sync.
-- Run this once in Supabase SQL Editor.

create table if not exists public.focusflow_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.focusflow_state enable row level security;

drop policy if exists "users read own focusflow state" on public.focusflow_state;
drop policy if exists "users insert own focusflow state" on public.focusflow_state;
drop policy if exists "users update own focusflow state" on public.focusflow_state;
drop policy if exists "users delete own focusflow state" on public.focusflow_state;

create policy "users read own focusflow state"
  on public.focusflow_state
  for select
  using (auth.uid() = user_id);

create policy "users insert own focusflow state"
  on public.focusflow_state
  for insert
  with check (auth.uid() = user_id);

create policy "users update own focusflow state"
  on public.focusflow_state
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users delete own focusflow state"
  on public.focusflow_state
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_focusflow_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_focusflow_state_updated_at on public.focusflow_state;

create trigger set_focusflow_state_updated_at
  before update on public.focusflow_state
  for each row
  execute function public.set_focusflow_state_updated_at();

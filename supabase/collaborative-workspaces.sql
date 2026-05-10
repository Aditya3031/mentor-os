-- FocusFlow collaborative workspaces.
-- Run this once in Supabase SQL Editor after auth is enabled.

create table if not exists public.collab_workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.collab_workspace_members (
  workspace_id uuid not null references public.collab_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.collab_workspace_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.collab_workspaces(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.collab_workspaces enable row level security;
alter table public.collab_workspace_members enable row level security;
alter table public.collab_workspace_tasks enable row level security;

drop policy if exists "members read workspaces" on public.collab_workspaces;
drop policy if exists "owners create workspaces" on public.collab_workspaces;
drop policy if exists "owners update workspaces" on public.collab_workspaces;
drop policy if exists "members read memberships" on public.collab_workspace_members;
drop policy if exists "users add own membership" on public.collab_workspace_members;
drop policy if exists "members read tasks" on public.collab_workspace_tasks;
drop policy if exists "members create tasks" on public.collab_workspace_tasks;
drop policy if exists "members update tasks" on public.collab_workspace_tasks;
drop policy if exists "members delete tasks" on public.collab_workspace_tasks;

create policy "members read workspaces"
  on public.collab_workspaces
  for select
  using (
    exists (
      select 1
      from public.collab_workspace_members m
      where m.workspace_id = id and m.user_id = auth.uid()
    )
  );

create policy "owners create workspaces"
  on public.collab_workspaces
  for insert
  with check (owner_id = auth.uid());

create policy "owners update workspaces"
  on public.collab_workspaces
  for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "members read memberships"
  on public.collab_workspace_members
  for select
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.collab_workspace_members m
      where m.workspace_id = collab_workspace_members.workspace_id
        and m.user_id = auth.uid()
    )
  );

create policy "users add own membership"
  on public.collab_workspace_members
  for insert
  with check (user_id = auth.uid());

create policy "members read tasks"
  on public.collab_workspace_tasks
  for select
  using (
    exists (
      select 1
      from public.collab_workspace_members m
      where m.workspace_id = collab_workspace_tasks.workspace_id
        and m.user_id = auth.uid()
    )
  );

create policy "members create tasks"
  on public.collab_workspace_tasks
  for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1
      from public.collab_workspace_members m
      where m.workspace_id = collab_workspace_tasks.workspace_id
        and m.user_id = auth.uid()
    )
  );

create policy "members update tasks"
  on public.collab_workspace_tasks
  for update
  using (
    exists (
      select 1
      from public.collab_workspace_members m
      where m.workspace_id = collab_workspace_tasks.workspace_id
        and m.user_id = auth.uid()
    )
  );

create policy "members delete tasks"
  on public.collab_workspace_tasks
  for delete
  using (
    exists (
      select 1
      from public.collab_workspace_members m
      where m.workspace_id = collab_workspace_tasks.workspace_id
        and m.user_id = auth.uid()
    )
  );

create or replace function public.join_workspace_by_invite(code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_workspace uuid;
begin
  select id into target_workspace
  from public.collab_workspaces
  where upper(invite_code) = upper(code);

  if target_workspace is null then
    raise exception 'Workspace invite code not found';
  end if;

  insert into public.collab_workspace_members (workspace_id, user_id, role)
  values (target_workspace, auth.uid(), 'member')
  on conflict (workspace_id, user_id) do nothing;

  return target_workspace;
end;
$$;

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

drop function if exists public.create_collab_workspace(text, text);
drop function if exists public.join_workspace_by_invite(text);

create policy "members read workspaces"
  on public.collab_workspaces
  for select
  using (
    exists (
      select 1
      from public.collab_workspace_members m
      where m.workspace_id = collab_workspaces.id and m.user_id = auth.uid()
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
  using (user_id = auth.uid());

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

create or replace function public.create_collab_workspace(workspace_name text, code text)
returns public.collab_workspaces
language plpgsql
security definer
set search_path = public
as $$
declare
  new_workspace public.collab_workspaces;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to create a workspace';
  end if;

  if length(trim(workspace_name)) = 0 then
    raise exception 'Workspace name is required';
  end if;

  insert into public.collab_workspaces (owner_id, name, invite_code)
  values (auth.uid(), trim(workspace_name), upper(trim(code)))
  returning * into new_workspace;

  insert into public.collab_workspace_members (workspace_id, user_id, role)
  values (new_workspace.id, auth.uid(), 'owner')
  on conflict (workspace_id, user_id) do nothing;

  return new_workspace;
end;
$$;

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

grant execute on function public.create_collab_workspace(text, text) to authenticated;
grant execute on function public.join_workspace_by_invite(text) to authenticated;
grant select, insert, update, delete on public.collab_workspaces to authenticated;
grant select, insert, update, delete on public.collab_workspace_members to authenticated;
grant select, insert, update, delete on public.collab_workspace_tasks to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.collab_workspace_tasks;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

notify pgrst, 'reload schema';

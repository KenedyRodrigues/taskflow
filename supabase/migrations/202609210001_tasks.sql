create table public.tasks (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 title text not null check (char_length(btrim(title)) between 1 and 160),
 description text check (char_length(description) <= 2000),
 status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index tasks_user_created_idx on public.tasks (user_id, created_at desc);
alter table public.tasks enable row level security;
alter table public.tasks force row level security;
revoke all on public.tasks from anon;
revoke all on public.tasks from authenticated;
grant select, delete on public.tasks to authenticated;
grant insert (title, description, status) on public.tasks to authenticated;
grant update (title, description, status) on public.tasks to authenticated;
create policy "Read own tasks" on public.tasks for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own tasks" on public.tasks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own tasks" on public.tasks for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own tasks" on public.tasks for delete to authenticated using ((select auth.uid()) = user_id);
create function public.set_task_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger tasks_updated_at before update on public.tasks for each row execute function public.set_task_updated_at();

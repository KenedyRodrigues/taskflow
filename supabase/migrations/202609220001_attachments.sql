begin;
create table public.task_attachments (
 id uuid primary key default gen_random_uuid(),
 task_id uuid not null references public.tasks(id) on delete restrict,
 user_id uuid not null default auth.uid() references auth.users(id),
 name text not null check (char_length(name) between 1 and 255),
 mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','audio/mpeg','audio/mp4','audio/x-m4a','audio/wav','audio/x-wav','audio/ogg')),
 size bigint not null check (size > 0 and size <= 20971520 and (mime_type not like 'image/%' or size <= 5242880)),
 path text not null unique,
 created_at timestamptz not null default now()
);
create index task_attachments_task_idx on public.task_attachments(task_id);
alter table public.task_attachments enable row level security;
alter table public.task_attachments force row level security;
revoke all on public.task_attachments from anon, authenticated;
grant select, delete on public.task_attachments to authenticated;
grant insert(task_id,name,mime_type,size,path) on public.task_attachments to authenticated;
create policy "Read own attachments" on public.task_attachments for select to authenticated using (user_id=(select auth.uid()));
create policy "Insert own attachments" on public.task_attachments for insert to authenticated with check (
 user_id=(select auth.uid()) and exists(select 1 from public.tasks t where t.id=task_id and t.user_id=(select auth.uid()))
 and split_part(path,'/',1)=(select auth.uid())::text and split_part(path,'/',2)=task_id::text
);
create policy "Delete own attachments" on public.task_attachments for delete to authenticated using (user_id=(select auth.uid()));
-- The task row lock serializes concurrent reservations; the limit also applies through the REST API.
create function public.limit_task_attachments() returns trigger language plpgsql set search_path='' as $$
begin
 perform 1 from public.tasks where id=new.task_id for update;
 if (select count(*) from public.task_attachments where task_id=new.task_id) >= 5 then
  raise exception 'A tarefa permite no máximo 5 anexos.';
 end if;
 return new;
end;
$$;
create trigger limit_task_attachments before insert on public.task_attachments for each row execute function public.limit_task_attachments();
-- Metadata must remain until the physical file is removed through the Storage API.
create function public.guard_attachment_delete() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from storage.objects where bucket_id='task-attachments' and name=old.path) then
  raise exception 'Remova o arquivo do Storage antes de excluir o anexo.';
 end if;
 return old;
end;
$$;
create trigger guard_attachment_delete before delete on public.task_attachments for each row execute function public.guard_attachment_delete();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values (
 'task-attachments','task-attachments',false,20971520,
 array['image/jpeg','image/png','image/webp','audio/mpeg','audio/mp4','audio/x-m4a','audio/wav','audio/x-wav','audio/ogg']
);
create policy "Read own task files" on storage.objects for select to authenticated using (
 bucket_id='task-attachments' and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists(select 1 from public.task_attachments a where a.path=storage.objects.name and a.user_id=(select auth.uid()))
);
create policy "Upload own task files" on storage.objects for insert to authenticated with check (
 bucket_id='task-attachments' and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists(select 1 from public.task_attachments a where a.path=storage.objects.name and a.user_id=(select auth.uid())
  and (metadata->>'size')::bigint=a.size and metadata->>'mimetype'=a.mime_type)
);
create policy "Delete own task files" on storage.objects for delete to authenticated using (
 bucket_id='task-attachments' and (storage.foldername(name))[1]=(select auth.uid())::text
);
commit;

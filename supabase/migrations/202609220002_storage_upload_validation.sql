begin;

-- Storage checks upload permission before final size metadata is available.
alter policy "Upload own task files" on storage.objects
with check (
 bucket_id = 'task-attachments'
 and (storage.foldername(name))[1] = (select auth.uid())::text
 and exists (
  select 1 from public.task_attachments a
  where a.path = storage.objects.name
    and a.user_id = (select auth.uid())
 )
);

-- Enforce real size and MIME when Storage persists the completed object.
create or replace function public.validate_task_file_metadata()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
 attachment public.task_attachments%rowtype;
begin
 if new.bucket_id <> 'task-attachments'
    or new.metadata is null
    or not (new.metadata ? 'size') then
  return new;
 end if;

 select * into attachment
 from public.task_attachments
 where path = new.name
 for key share;

 if not found then
  raise exception 'O arquivo precisa de um anexo reservado.';
 end if;

 if (new.metadata->>'size')::bigint <> attachment.size
    or new.metadata->>'mimetype' is distinct from attachment.mime_type then
  raise exception 'O tamanho ou formato não corresponde ao anexo reservado.';
 end if;

 return new;
end;
$$;

drop trigger if exists validate_task_file_metadata on storage.objects;
create trigger validate_task_file_metadata
before insert or update on storage.objects
for each row execute function public.validate_task_file_metadata();

commit;

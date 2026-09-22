begin;

-- Storage performs a permission preflight before the completed object's metadata exists.
-- Ownership and reservation are enforced by the trigger below when the object is written.
drop policy if exists "Upload own task files" on storage.objects;
create policy "Upload own task files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'task-attachments'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (storage.foldername(name))[2] is not null
);

create or replace function public.validate_task_file_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  attachment public.task_attachments%rowtype;
  declared_size bigint;
  declared_mime text;
begin
  if new.bucket_id <> 'task-attachments' then
    return new;
  end if;

  select * into attachment
  from public.task_attachments
  where path = new.name
  for key share;

  if not found then
    raise exception 'O arquivo precisa de um anexo reservado.';
  end if;

  declared_mime := new.metadata->>'mimetype';
  if new.metadata ? 'size' then
    declared_size := (new.metadata->>'size')::bigint;
  elsif new.metadata ? 'contentLength' then
    declared_size := (new.metadata->>'contentLength')::bigint;
  end if;

  if declared_size is not null and declared_size <> attachment.size then
    raise exception 'O tamanho não corresponde ao anexo reservado.';
  end if;

  if declared_mime is not null and declared_mime <> attachment.mime_type then
    raise exception 'O formato não corresponde ao anexo reservado.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_task_file_metadata on storage.objects;
create trigger validate_task_file_metadata
before insert or update on storage.objects
for each row execute function public.validate_task_file_metadata();

commit;

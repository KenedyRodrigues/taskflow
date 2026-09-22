begin;
create or replace function public.validate_task_file_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.bucket_id = 'task-attachments' and not exists (
    select 1 from public.task_attachments a
    where a.path = new.name
  ) then
    raise exception 'O arquivo precisa de um anexo reservado.';
  end if;
  return new;
end;
$$;
commit;

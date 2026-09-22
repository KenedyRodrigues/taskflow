begin;

alter table public.task_attachments
  drop constraint if exists task_attachments_mime_type_check;
alter table public.task_attachments
  drop constraint if exists task_attachments_size_check;

alter table public.task_attachments
  add constraint task_attachments_mime_type_check check (
    mime_type in (
      'image/jpeg','image/png','image/webp',
      'audio/mpeg','audio/mp4','audio/x-m4a','audio/wav','audio/x-wav','audio/ogg',
      'video/mp4','video/webm','video/quicktime'
    )
  ),
  add constraint task_attachments_size_check check (
    size > 0
    and size <= 20971520
    and (mime_type not like 'image/%' or size <= 5242880)
  );

update storage.buckets
set allowed_mime_types = array[
  'image/jpeg','image/png','image/webp',
  'audio/mpeg','audio/mp4','audio/x-m4a','audio/wav','audio/x-wav','audio/ogg',
  'video/mp4','video/webm','video/quicktime'
]
where id = 'task-attachments';

commit;

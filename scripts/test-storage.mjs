import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
const env = process.env;
for (const name of [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "TEST_USER_A_EMAIL",
  "TEST_USER_A_PASSWORD",
  "TEST_USER_B_EMAIL",
  "TEST_USER_B_PASSWORD",
])
  assert.ok(env[name], "Defina " + name + " em .env.local");
const client = () =>
  createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
const a = client(),
  b = client(),
  anonymous = client(),
  bucket = "task-attachments";
let taskId;
const reservations = [];
const bytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aO9sAAAAASUVORK5CYII=",
  "base64",
);
try {
  const first = await a.auth.signInWithPassword({
    email: env.TEST_USER_A_EMAIL,
    password: env.TEST_USER_A_PASSWORD,
  });
  assert.ifError(first.error);
  const second = await b.auth.signInWithPassword({
    email: env.TEST_USER_B_EMAIL,
    password: env.TEST_USER_B_PASSWORD,
  });
  assert.ifError(second.error);
  assert.notEqual(first.data.user.id, second.data.user.id);
  const task = await a
    .from("tasks")
    .insert({ title: "TaskFlow: teste de anexos", status: "todo" })
    .select()
    .single();
  assert.ifError(task.error);
  taskId = task.data.id;
  const path =
    first.data.user.id + "/" + taskId + "/" + crypto.randomUUID() + ".png";
  const row = {
    task_id: taskId,
    name: "teste.png",
    mime_type: "image/png",
    size: bytes.length,
    path,
  };
  const forged = await b
    .from("task_attachments")
    .insert({
      ...row,
      path: second.data.user.id + "/" + taskId + "/forged.png",
    });
  assert.ok(forged.error, "B não pode reservar anexo para a tarefa A");
  const attachment = await a
    .from("task_attachments")
    .insert(row)
    .select()
    .single();
  assert.ifError(attachment.error);
  reservations.push(attachment.data);
  const upload = await a.storage
    .from(bucket)
    .upload(path, bytes, { contentType: "image/png" });
  assert.ifError(upload.error);
  const read = await a.storage.from(bucket).download(path);
  assert.ifError(read.error);
  assert.equal(read.data.size, bytes.length);
  assert.ok(
    (await b.storage.from(bucket).download(path)).error,
    "B não pode baixar o arquivo A",
  );
  assert.ok(
    (await anonymous.storage.from(bucket).download(path)).error,
    "Anônimo não pode baixar arquivo",
  );
  assert.ok(
    (await b.storage.from(bucket).createSignedUrl(path, 60)).error,
    "B não pode criar link",
  );
  const bRows = await b
    .from("task_attachments")
    .select("*")
    .eq("task_id", taskId);
  assert.ifError(bRows.error);
  assert.equal(bRows.data.length, 0);
  const bDelete = await b
    .from("task_attachments")
    .delete()
    .eq("id", attachment.data.id)
    .select();
  assert.ifError(bDelete.error);
  assert.equal(bDelete.data.length, 0);
  await b.storage.from(bucket).remove([path]);
  assert.ifError((await a.storage.from(bucket).download(path)).error);
  assert.ok(
    (await a.from("task_attachments").delete().eq("id", attachment.data.id))
      .error,
    "Não pode abandonar arquivo removendo metadados",
  );
  assert.ok(
    (await a.from("tasks").delete().eq("id", taskId)).error,
    "Não pode excluir tarefa sem remover anexos",
  );
  assert.ok(
    (
      await a.storage
        .from(bucket)
        .upload(first.data.user.id + "/" + taskId + "/unreserved.png", bytes, {
          contentType: "image/png",
        })
    ).error,
    "Upload exige reserva",
  );
  assert.ok(
    (
      await a
        .from("task_attachments")
        .insert({ ...row, path: path + "large", size: 5242881 })
    ).error,
    "Imagem maior que 5 MB deve falhar",
  );
  assert.ok(
    (
      await a
        .from("task_attachments")
        .insert({ ...row, path: path + "svg", mime_type: "image/svg+xml" })
    ).error,
    "SVG não permitido",
  );
  for (let i = 0; i < 4; i++) {
    const r = await a
      .from("task_attachments")
      .insert({ ...row, path: path + "-" + i })
      .select()
      .single();
    assert.ifError(r.error);
    reservations.push(r.data);
  }
  assert.ok(
    (await a.from("task_attachments").insert({ ...row, path: path + "-six" }))
      .error,
    "Limite de 5 anexos",
  );
  console.log(
    "OK: Storage privado, upload, leitura, isolamento entre contas, limites e proteção contra arquivos abandonados.",
  );
} finally {
  for (const row of reservations) {
    const removed = await a.storage.from(bucket).remove([row.path]);
    if (removed.error) console.error("Falha ao limpar arquivo de teste.");
    const deleted = await a.from("task_attachments").delete().eq("id", row.id);
    if (deleted.error) console.error("Falha ao limpar registro de teste.");
  }
  if (taskId) {
    const removed = await a.from("tasks").delete().eq("id", taskId);
    if (removed.error) console.error("Falha ao limpar tarefa de teste.");
  }
  await Promise.all([a.auth.signOut(), b.auth.signOut()]);
}

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
  assert.ok(env[name], `Defina ${name} em .env.local`);
const client = () =>
  createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
const a = client(),
  b = client(),
  anon = client();
const ids = [];
try {
  const loginA = await a.auth.signInWithPassword({
    email: env.TEST_USER_A_EMAIL,
    password: env.TEST_USER_A_PASSWORD,
  });
  const loginB = await b.auth.signInWithPassword({
    email: env.TEST_USER_B_EMAIL,
    password: env.TEST_USER_B_PASSWORD,
  });
  assert.ifError(loginA.error);
  assert.ifError(loginB.error);
  assert.notEqual(
    loginA.data.user.id,
    loginB.data.user.id,
    "As contas de teste devem ser diferentes",
  );
  const created = await a
    .from("tasks")
    .insert({ title: "TaskFlow: teste de isolamento", status: "todo" })
    .select()
    .single();
  assert.ifError(created.error);
  ids.push(created.data.id);
  const id = created.data.id;
  assert.equal(created.data.user_id, loginA.data.user.id);
  const anonymousRead = await anon.from("tasks").select("*").eq("id", id);
  assert.ok(
    anonymousRead.error || anonymousRead.data.length === 0,
    "Anônimo não pode ler tarefas",
  );
  const readB = await b.from("tasks").select("*").eq("id", id);
  assert.ifError(readB.error);
  assert.equal(readB.data.length, 0);
  const updateB = await b
    .from("tasks")
    .update({ title: "acesso indevido" })
    .eq("id", id)
    .select();
  assert.ifError(updateB.error);
  assert.equal(updateB.data.length, 0);
  const deleteB = await b.from("tasks").delete().eq("id", id).select();
  assert.ifError(deleteB.error);
  assert.equal(deleteB.data.length, 0);
  const steal = await a
    .from("tasks")
    .update({ user_id: loginB.data.user.id })
    .eq("id", id);
  assert.ok(steal.error, "Não deve permitir mudar o proprietário");
  const spoof = await b
    .from("tasks")
    .insert({ title: "proprietário forjado", user_id: loginA.data.user.id });
  assert.ok(spoof.error, "Não deve permitir forjar proprietário");
  const invalid = await a
    .from("tasks")
    .update({ status: "invalid" })
    .eq("id", id);
  assert.ok(invalid.error);
  const blank = await a.from("tasks").update({ title: "   " }).eq("id", id);
  assert.ok(blank.error);
  for (const status of ["doing", "done", "todo"]) {
    const updated = await a
      .from("tasks")
      .update({ status, description: "Descrição atualizada" })
      .eq("id", id)
      .select()
      .single();
    assert.ifError(updated.error);
    assert.equal(updated.data.status, status);
  }
  const removed = await a.from("tasks").delete().eq("id", id).select();
  assert.ifError(removed.error);
  assert.equal(removed.data.length, 1);
  console.log(
    "OK: CRUD, status, validação, acesso anônimo e isolamento entre duas contas.",
  );
} finally {
  if (ids.length) {
    const cleanup = await a.from("tasks").delete().in("id", ids);
    if (cleanup.error)
      console.error("Falha ao limpar tarefa de teste:", cleanup.error.message);
  }
  await Promise.all([
    a.auth.signOut({ scope: "local" }),
    b.auth.signOut({ scope: "local" }),
  ]);
}

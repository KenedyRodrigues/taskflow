import { test } from "node:test";
import assert from "node:assert/strict";
import { taskInput } from "../src/backend/validation/tasks.ts";
import { attachmentInput } from "../src/backend/validation/attachments.ts";
test("tarefas normalizam conteúdo e rejeitam entradas inválidas", () => {
  assert.deepEqual(
    taskInput({ title: "  Uma tarefa  ", description: " ", status: "todo" }),
    { title: "Uma tarefa", description: null, status: "todo" },
  );
  for (const input of [
    { title: " ", status: "todo" },
    { title: "x".repeat(161), status: "todo" },
    { title: "ok", description: "x".repeat(2001), status: "todo" },
    { title: "ok", status: "outro" },
    { title: 123, status: "todo" },
    null,
  ])
    assert.throws(() => taskInput(input));
});
test("anexos validam tipo, tamanho, nome e limites distintos", () => {
  assert.equal(
    attachmentInput({ name: "foto.png", mime_type: "image/png", size: 5242880 })
      .size,
    5242880,
  );
  assert.equal(
    attachmentInput({
      name: "audio.mp3",
      mime_type: "audio/mpeg",
      size: 20971520,
    }).size,
    20971520,
  );
  for (const input of [
    { name: "x", mime_type: "image/png", size: 5242881 },
    { name: "x", mime_type: "audio/mpeg", size: 20971521 },
    { name: "x", mime_type: "image/svg+xml", size: 10 },
    { name: "x", mime_type: "image/png", size: 0 },
    { name: "", mime_type: "image/png", size: 1 },
    { name: "x", mime_type: "image/png", size: 1.5 },
  ])
    assert.throws(() => attachmentInput(input));
});

import { assertSameOrigin } from "../src/backend/validation/origin.ts";
test("origem compara o host público sem aceitar requisições de outro site", () => {
  assert.doesNotThrow(() =>
    assertSameOrigin(
      new Request("http://localhost:3100/api/tasks", {
        method: "POST",
        headers: { host: "127.0.0.1:3100", origin: "http://127.0.0.1:3100" },
      }),
    ),
  );
  assert.doesNotThrow(() =>
    assertSameOrigin(
      new Request("http://internal/api/tasks", {
        method: "POST",
        headers: {
          host: "taskflow.example.com",
          origin: "https://taskflow.example.com",
          "x-forwarded-proto": "https",
        },
      }),
    ),
  );
  assert.throws(() =>
    assertSameOrigin(
      new Request("https://taskflow.example.com/api/tasks", {
        method: "POST",
        headers: {
          host: "taskflow.example.com",
          origin: "https://evil.example.com",
        },
      }),
    ),
  );
  assert.throws(() =>
    assertSameOrigin(
      new Request("https://taskflow.example.com/api/tasks", {
        method: "POST",
        headers: { "sec-fetch-site": "cross-site" },
      }),
    ),
  );
});

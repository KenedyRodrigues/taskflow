import { test, expect } from "@playwright/test";
test("CRUD autenticado, anexos, estatísticas, menu e logout", async ({
  page,
}, testInfo) => {
  test.skip(
    !process.env.TEST_USER_A_EMAIL || !process.env.TEST_USER_A_PASSWORD,
    "Configure a conta de teste A em .env.local.",
  );
  test.setTimeout(120000);
  const name = "E2E " + testInfo.project.name + " " + Date.now();
  let taskId: string | undefined;
  await page.goto("/login");
  await page
    .getByLabel("E-mail", { exact: true })
    .fill(process.env.TEST_USER_A_EMAIL!);
  await page
    .getByLabel("Senha", { exact: true })
    .fill(process.env.TEST_USER_A_PASSWORD!);
  await page.getByRole("button", { name: "Acessar minhas tarefas" }).click();
  await expect(page).toHaveURL(/\/tasks$/);
  try {
    await page
      .getByRole("button", { name: "Nova tarefa", exact: true })
      .click();
    await page.getByLabel("Título *", { exact: true }).fill(name);
    await page
      .getByLabel("Descrição", { exact: false })
      .fill("Descrição de teste");
    await page
      .getByRole("combobox", { name: "Status", exact: true })
      .selectOption("doing");
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aO9sAAAAASUVORK5CYII=",
      "base64",
    );
    const wav = Buffer.alloc(46);
    wav.write("RIFF");
    wav.writeUInt32LE(38, 4);
    wav.write("WAVEfmt ", 8);
    wav.writeUInt32LE(16, 16);
    wav.writeUInt16LE(1, 20);
    wav.writeUInt16LE(1, 22);
    wav.writeUInt32LE(8000, 24);
    wav.writeUInt32LE(16000, 28);
    wav.writeUInt16LE(2, 32);
    wav.writeUInt16LE(16, 34);
    wav.write("data", 36);
    wav.writeUInt32LE(2, 40);
    const video = Buffer.from(
      await page.evaluate(async () => {
        const canvas = document.createElement("canvas");
        canvas.width = 96;
        canvas.height = 54;
        const context = canvas.getContext("2d")!;
        const stream = canvas.captureStream(8);
        const recorder = new MediaRecorder(stream, {
          mimeType: "video/webm;codecs=vp8",
        });
        const chunks: Blob[] = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size) chunks.push(event.data);
        };
        const stopped = new Promise<void>((resolve) => {
          recorder.onstop = () => resolve();
        });
        recorder.start();
        context.fillStyle = "#347c62";
        context.fillRect(0, 0, 96, 54);
        context.fillStyle = "white";
        context.font = "bold 18px sans-serif";
        context.fillText("TaskFlow", 8, 32);
        await new Promise((resolve) => setTimeout(resolve, 350));
        recorder.stop();
        await stopped;
        stream.getTracks().forEach((track) => track.stop());
        const bytes = new Uint8Array(
          await new Blob(chunks, { type: "video/webm" }).arrayBuffer(),
        );
        return Array.from(bytes);
      }),
    );
    await page.getByLabel("Adicionar arquivos", { exact: true }).setInputFiles([
      { name: "imagem.png", mimeType: "image/png", buffer: png },
      { name: "audio.wav", mimeType: "audio/wav", buffer: wav },
      { name: "video.webm", mimeType: "video/webm", buffer: video },
    ]);
    await page
      .getByRole("button", { name: "Salvar tarefa", exact: true })
      .click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 40000 });
    const tasks = await (await page.request.get("/api/tasks")).json();
    taskId = tasks.find((t: { title: string }) => t.title === name)?.id;
    expect(taskId).toBeTruthy();
    await page.getByRole("textbox", { name: "Buscar tarefas" }).fill(name);
    await page.getByRole("button", { name: "Kanban", exact: true }).click();
    const card = page.locator(".kanban-card").filter({ hasText: name });
    await expect(
      card.getByText("Descrição de teste", { exact: true }),
    ).toBeVisible();
    await expect(card.locator("img")).toBeVisible({ timeout: 20000 });
    await expect(card.locator("audio")).toBeVisible({ timeout: 20000 });
    await expect(card.locator("video")).toBeVisible({ timeout: 20000 });
    await card
      .getByRole("button", { name: "Abrir detalhes de " + name, exact: true })
      .click();
    const details = page.getByRole("dialog");
    await expect(
      details.getByText("Descrição de teste", { exact: true }),
    ).toBeVisible();
    await expect(details.locator("img")).toBeVisible({ timeout: 20000 });
    await expect(details.locator("audio")).toBeVisible({ timeout: 20000 });
    await expect(details.locator("video")).toBeVisible({ timeout: 20000 });
    await details.getByRole("button", { name: "Fechar detalhes" }).click();
    await page
      .getByRole("button", { name: "Editar " + name, exact: true })
      .click();
    await expect(page.getByText("imagem.png", { exact: false })).toBeVisible();
    await expect(page.getByText("audio.wav", { exact: false })).toBeVisible();
    await expect(page.getByText("video.webm", { exact: false })).toBeVisible();
    while (
      await page
        .getByRole("button", { name: "Abrir prévia", exact: true })
        .count()
    )
      await page
        .getByRole("button", { name: "Abrir prévia", exact: true })
        .first()
        .click();
    await expect(page.getByRole("dialog").locator("img")).toBeVisible();
    await expect(page.getByRole("dialog").locator("audio")).toBeVisible();
    await expect(page.getByRole("dialog").locator("video")).toBeVisible();
    await page
      .getByRole("combobox", { name: "Status", exact: true })
      .selectOption("done");
    await page
      .getByRole("button", { name: "Salvar tarefa", exact: true })
      .click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.reload();
    await page.getByRole("textbox", { name: "Buscar tarefas" }).fill(name);
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Lista", exact: true }).click();
    await expect(
      page
        .locator(".task-row")
        .filter({ hasText: name })
        .getByText("Concluída", { exact: true }),
    ).toBeVisible();
    if (testInfo.project.name === "mobile")
      await page.getByRole("button", { name: "Abrir menu" }).click();
    else {
      await page.getByRole("button", { name: "Recolher menu" }).click();
      await page.reload();
      await expect(
        page.getByRole("button", { name: "Expandir menu" }),
      ).toBeVisible();
    }
    await page.getByRole("link", { name: "Estatísticas", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Estatísticas", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("img", { name: /Distribuição/ })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (testInfo.project.name === "mobile")
      await page.getByRole("button", { name: "Abrir menu" }).click();
    await page
      .getByRole("link", { name: "Minhas tarefas", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Excluir " + name, exact: true })
      .click();
    await page.getByRole("button", { name: "Cancelar", exact: true }).click();
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Excluir " + name, exact: true })
      .click();
    await page
      .getByRole("button", { name: "Excluir tarefa", exact: true })
      .click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    taskId = undefined;
    if (testInfo.project.name === "mobile")
      await page.getByRole("button", { name: "Abrir menu" }).click();
    const logout = page.getByRole("button", { name: "Sair da conta" });
    if (testInfo.project.name === "desktop")
      await logout.evaluate((button: HTMLButtonElement) => button.click());
    else await logout.click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/tasks");
    await expect(page).toHaveURL(/\/login$/);
  } finally {
    // Cleanup must not hide the original UI assertion failure.
    try {
      if (taskId) await page.request.delete("/api/tasks/" + taskId);
      // A failed upload may save the task before the UI closes; cleanup by its unique title.
      const response = await page.request.get("/api/tasks");
      if (response.ok()) {
        for (const task of await response.json())
          if (task.title === name)
            await page.request.delete("/api/tasks/" + task.id);
      }
    } catch {
      /* A timed-out context may already be closed. */
    }
  }
});

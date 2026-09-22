import { test, expect } from "@playwright/test";
test("tarefa sem anexos, filtros, estatísticas e logout", async ({
  page,
}, info) => {
  test.skip(
    !process.env.TEST_USER_A_EMAIL || !process.env.TEST_USER_A_PASSWORD,
    "Configure a conta A.",
  );
  const name = "E2E sem anexos " + info.project.name + " " + Date.now();
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
      .fill("Descrição exibida nos detalhes");
    await page
      .getByRole("combobox", { name: "Status", exact: true })
      .selectOption("doing");
    await page
      .getByRole("button", { name: "Salvar tarefa", exact: true })
      .click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.getByRole("textbox", { name: "Buscar tarefas" }).fill(name);
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Abrir detalhes de " + name, exact: true })
      .click();
    const details = page.getByRole("dialog");
    await expect(
      details.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await expect(
      details.getByText("Descrição exibida nos detalhes", { exact: true }),
    ).toBeVisible();
    await expect(details.getByRole("textbox")).toHaveCount(0);
    await details.getByRole("button", { name: "Fechar detalhes" }).click();
    await page.getByRole("button", { name: "Kanban", exact: true }).click();
    const card = page.locator(".kanban-card").filter({ hasText: name });
    const doneColumn = page.getByRole("region", { name: "Concluída" });
    await expect(card).toBeVisible();
    await expect(
      card.getByText("Descrição exibida nos detalhes", { exact: true }),
    ).toBeVisible();
    await card
      .getByRole("button", { name: "Abrir detalhes de " + name, exact: true })
      .click();
    await expect(
      page.getByRole("dialog").getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Fechar detalhes" }).click();
    if (info.project.name === "desktop") await card.dragTo(doneColumn);
    else
      await card
        .getByRole("combobox", { name: "Mover " + name })
        .selectOption("done");
    await expect(
      doneColumn.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Tarefa movida para concluída.", { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Kanban", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page
        .getByRole("region", { name: "Concluída" })
        .getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Lista", exact: true }).click();
    await expect(
      page
        .locator(".task-row")
        .filter({ hasText: name })
        .getByText("Concluída", { exact: true }),
    ).toBeVisible();
    if (info.project.name === "mobile")
      await page.getByRole("button", { name: "Abrir menu" }).click();
    await page.getByRole("link", { name: "Estatísticas", exact: true }).click();
    await expect(page.getByRole("img", { name: /Distribuição/ })).toBeVisible();
    if (info.project.name === "mobile")
      await page.getByRole("button", { name: "Abrir menu" }).click();
    await page
      .getByRole("link", { name: "Minhas tarefas", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Excluir " + name, exact: true })
      .click();
    await page
      .getByRole("button", { name: "Excluir tarefa", exact: true })
      .click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    if (info.project.name === "mobile")
      await page.getByRole("button", { name: "Abrir menu" }).click();
    await page.getByRole("button", { name: "Sair da conta" }).click();
    await expect(page).toHaveURL(/\/login$/);
  } finally {
    try {
      const response = await page.request.get("/api/tasks", { timeout: 10000 });
      if (response.ok())
        for (const task of await response.json())
          if (task.title === name)
            await page.request.delete("/api/tasks/" + task.id, {
              timeout: 10000,
            });
    } catch {}
  }
});

import { test, expect } from "@playwright/test";
test("painel, busca e filtros sem transbordamento horizontal", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Minhas tarefas." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Em andamento 0", exact: true })
    .click();
  await expect(
    page.getByText("Nenhuma tarefa corresponde a este filtro."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await page
    .getByRole("textbox", { name: "Buscar tarefas" })
    .fill("inexistente");
  await expect(
    page.getByText("Nenhuma tarefa corresponde a este filtro."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await expect(
    page.getByRole("heading", { name: "Dê espaço ao seu próximo passo." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("criação exige login, alterna cadastro e fecha com Escape", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Nova tarefa", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Bom ter você por aqui." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cadastre-se" }).click();
  await expect(
    page.getByRole("heading", { name: "Seu espaço começa aqui." }),
  ).toBeVisible();
  await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute(
    "minlength",
    "8",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

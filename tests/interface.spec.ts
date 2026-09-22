import { test, expect } from "@playwright/test";
test("visitantes vão ao login e não recebem o painel", async ({
  page,
  request,
}) => {
  for (const path of ["/", "/tasks", "/statistics"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Entre no TaskFlow" }),
    ).toBeVisible();
    await expect(page.getByRole("navigation")).toHaveCount(0);
  }
  expect((await request.get("/api/tasks")).status()).toBe(401);
  expect(
    (
      await request.post("/api/tasks", {
        data: { title: "negado", status: "todo" },
      })
    ).status(),
  ).toBe(401);
  expect(
    (
      await request.get("/api/attachments/00000000-0000-0000-0000-000000000000")
    ).status(),
  ).toBe(401);
});
test("login, cadastro, favicon e layout responsivo", async ({
  page,
  request,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Criar conta", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Crie sua conta" }),
  ).toBeVisible();
  await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute(
    "minlength",
    "8",
  );
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Entre no TaskFlow" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const icon = await page.locator('link[rel="icon"]').getAttribute("href");
  expect(icon).toBeTruthy();
  expect((await request.get(icon!)).ok()).toBe(true);
});

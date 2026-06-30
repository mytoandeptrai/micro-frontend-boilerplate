import { expect, test } from "@playwright/test"

async function login(page: Parameters<typeof test>[1] extends { page: infer P } ? P : never) {
  await page.goto("/login")
  await page.getByLabel("Email").fill("alice@ops.dev")
  await page.getByLabel("Password").fill("password123")
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page).toHaveURL("/")
}

test.describe("Monitor App", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
    await login(page)
  })

  test("navigate to /monitor loads MonitorApp with stats cards", async ({ page }) => {
    await page.goto("/monitor")
    await expect(page.getByText("Total Members")).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText("Active")).toBeVisible()
    await expect(page.getByText("Admins")).toBeVisible()
  })

  test("add member at /team then /monitor shows updated totalMembers", async ({ page }) => {
    await page.goto("/monitor")
    const totalBefore = await page.getByText(/Total Members/).locator("..").locator("p.text-2xl").textContent()

    await page.goto("/team")
    await page.getByRole("button", { name: /New Member|Add Member/i }).click()
    await page.getByLabel("Name").fill("E2E TestUser")
    await page.getByLabel("Email").fill(`e2e-${Date.now()}@ops.dev`)
    await page.getByRole("button", { name: /^(Save|Create|Submit)/ }).click()
    await expect(page.getByText("Member created")).toBeVisible({ timeout: 5_000 })

    await page.goto("/monitor")
    const totalAfter = await page.getByText(/Total Members/).locator("..").locator("p.text-2xl").textContent()
    expect(Number(totalAfter)).toBeGreaterThan(Number(totalBefore))
  })
})

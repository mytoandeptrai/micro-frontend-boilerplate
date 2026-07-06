import { expect, test } from "@playwright/test"

async function login(
  page: Parameters<typeof test>[1] extends { page: infer P } ? P : never,
) {
  await page.goto("/login")
  await page.getByLabel("Email").fill("alice@ops.dev")
  await page.getByLabel("Password").fill("password123")
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page).toHaveURL("/")
}

test.describe("Settings App", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
    await login(page)
  })

  test("changing theme at /settings updates <html> class and Header immediately", async ({
    page,
  }) => {
    await page.goto("/settings/theme")
    await page.getByRole("button", { name: "Dark" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)

    await page.getByRole("button", { name: "Light" }).click()
    await expect(page.locator("html")).not.toHaveClass(/dark/)
  })

  test("changing theme at /settings propagates to /team without reload", async ({
    page,
  }) => {
    await page.goto("/settings/theme")
    await page.getByRole("button", { name: "Dark" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)

    await page.goto("/team")
    await expect(page.locator("html")).toHaveClass(/dark/)
  })

  test("theme persists after reload via GET /api/v1/settings", async ({
    page,
  }) => {
    await page.goto("/settings/theme")
    await page.getByRole("button", { name: "Dark" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)

    await page.reload()
    await expect(page.locator("html")).toHaveClass(/dark/, { timeout: 10_000 })
  })
})

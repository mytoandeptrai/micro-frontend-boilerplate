import { expect, type Page, test } from "@playwright/test"

async function loginAs(page: Page, email: string, password = "password123") {
  await page.context().clearCookies()
  await page.goto("/login")
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(password)
  await page.getByRole("button", { name: "Sign in" }).click()
  await page.waitForURL("/")
}

test.describe("Theme toggle", () => {
  test("persists dark mode after reload", async ({ page }) => {
    await loginAs(page, "alice@ops.dev")
    await page.getByRole("button", { name: "Toggle theme" }).click()
    await page.reload()
    const html = page.locator("html")
    await expect(html).toHaveClass(/dark/)
  })
})

test.describe("Role-based UI — viewer", () => {
  test("viewer cannot see Delete button on /team", async ({ page }) => {
    // carol@ops.dev is viewer in seed data
    await loginAs(page, "carol@ops.dev")
    await page.goto("/team")
    await page.waitForSelector("table")
    await expect(page.getByRole("button", { name: "Delete" })).not.toBeVisible()
    await expect(page.getByRole("button", { name: "Create Member" })).not.toBeVisible()
  })
})

test.describe("Role-based UI — admin", () => {
  test("admin sees Create Member and Delete buttons on /team", async ({
    page,
  }) => {
    await loginAs(page, "alice@ops.dev")
    await page.goto("/team")
    await page.waitForSelector("table")
    await expect(page.getByText("Create Member")).toBeVisible()
    await expect(page.getByRole("button", { name: "Delete" }).first()).toBeVisible()
  })
})

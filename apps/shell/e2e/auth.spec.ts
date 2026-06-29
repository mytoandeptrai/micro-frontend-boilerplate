import { expect, test } from "@playwright/test"

test.describe("Auth flows", () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth cookie before each test
    await page.context().clearCookies()
  })

  test("unauthenticated user visiting / is redirected to /login", async ({
    page,
  }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
  })

  test("unauthenticated user visiting /team is redirected to /login", async ({
    page,
  }) => {
    await page.goto("/team")
    await expect(page).toHaveURL(/\/login/)
  })

  test("login with valid credentials redirects to dashboard", async ({
    page,
  }) => {
    await page.goto("/login")
    await page.getByLabel("Email").fill("alice@ops.dev")
    await page.getByLabel("Password").fill("password123")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL("/")
    await expect(page.getByText("Ops Dashboard")).toBeVisible()
  })

  test("returnUrl: visiting /team before login redirects back after login", async ({
    page,
  }) => {
    await page.goto("/team")
    await expect(page).toHaveURL(/\/login/)
    await page.getByLabel("Email").fill("alice@ops.dev")
    await page.getByLabel("Password").fill("password123")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL(/\/team/)
  })

  test("invalid credentials shows error message", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Email").fill("alice@ops.dev")
    await page.getByLabel("Password").fill("wrongpassword")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page.getByRole("alert")).toContainText(
      "Invalid email or password",
    )
    await expect(page).toHaveURL(/\/login/)
  })

  test("logout clears session and redirects to /login", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Email").fill("alice@ops.dev")
    await page.getByLabel("Password").fill("password123")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL("/")

    await page.getByRole("button", { name: "Logout" }).click()
    await expect(page).toHaveURL(/\/login/)

    // Visiting protected route after logout redirects again
    await page.goto("/")
    await expect(page).toHaveURL(/\/login/)
  })

  test("GuestRoute: authenticated user visiting /login is redirected to /", async ({
    page,
  }) => {
    // Log in first
    await page.goto("/login")
    await page.getByLabel("Email").fill("alice@ops.dev")
    await page.getByLabel("Password").fill("password123")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL("/")

    // Try to visit login again
    await page.goto("/login")
    await expect(page).toHaveURL("/")
  })
})

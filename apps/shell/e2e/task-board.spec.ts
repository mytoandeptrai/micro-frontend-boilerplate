import { expect, test } from "@playwright/test"

async function enterName(page: import("@playwright/test").Page, name: string) {
  await page.goto("/")
  await page.getByPlaceholder("Your name").fill(name)
  await page.getByRole("button", { name: "Continue" }).click()
}

test("name modal appears, submitting name shows it in Header", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByText("Welcome to Task Board")).toBeVisible()

  await page.getByPlaceholder("Your name").fill("Alice")
  await page.getByRole("button", { name: "Continue" }).click()

  await expect(page.getByText("Welcome to Task Board")).not.toBeVisible()
  await expect(page.locator("header")).toContainText("Alice")
})

test("/tasks: add task, filter all/active/completed, URL reflects filter", async ({ page }) => {
  await enterName(page, "Alice")
  await page.getByRole("link", { name: "Tasks" }).click()
  await expect(page).toHaveURL(/\/tasks/)

  await page.getByPlaceholder("Add a task").fill("Buy milk")
  await page.getByRole("button", { name: "Add" }).click()
  await expect(page.getByText("Buy milk")).toBeVisible()

  await page.getByPlaceholder("Add a task").fill("Walk dog")
  await page.getByRole("button", { name: "Add" }).click()
  await page.getByRole("checkbox").first().click()

  await page.getByRole("button", { name: "active" }).click()
  await expect(page).toHaveURL(/filter=active/)
  await expect(page.getByText("Walk dog")).toBeVisible()

  await page.getByRole("button", { name: "completed" }).click()
  await expect(page).toHaveURL(/filter=completed/)
  await expect(page.getByText("Buy milk")).toBeVisible()
  await expect(page.getByText("Walk dog")).not.toBeVisible()
})

test("adding a task on /tasks updates /stats in real-time", async ({ page }) => {
  await enterName(page, "Alice")
  await page.getByRole("link", { name: "Tasks" }).click()
  await page.getByPlaceholder("Add a task").fill("Buy milk")
  await page.getByRole("button", { name: "Add" }).click()

  await page.getByRole("link", { name: "Stats" }).click()
  await expect(page).toHaveURL(/\/stats/)
  await expect(page.getByText("Total Tasks")).toBeVisible()

  const totalCard = page.getByText("Total Tasks").locator('xpath=ancestor::*[@data-slot="card"]')
  await expect(totalCard).toContainText("1")
})

test("theme toggle changes app-wide and persists after reload", async ({ page }) => {
  await enterName(page, "Alice")

  const html = page.locator("html")
  await expect(html).toHaveClass(/dark/)

  await page.getByRole("button", { name: "Toggle theme" }).click()
  await expect(html).not.toHaveClass(/dark/)

  await page.reload()
  await expect(html).not.toHaveClass(/dark/)
})

test("EventDebugger shows task events in DEV mode", async ({ page }) => {
  await enterName(page, "Alice")
  await page.getByRole("link", { name: "Tasks" }).click()
  await page.getByPlaceholder("Add a task").fill("Buy milk")
  await page.getByRole("button", { name: "Add" }).click()

  await page.getByRole("button", { name: "Events" }).click()
  await expect(page.getByText(/task:added/, { exact: false }).last()).toBeVisible()
})

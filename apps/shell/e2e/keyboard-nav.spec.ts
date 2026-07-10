import { expect, test } from "@playwright/test"

test("name modal: fully usable by keyboard, focus stays trapped inside", async ({ page }) => {
  await page.goto("/")

  const nameInput = page.getByPlaceholder("Your name")
  await expect(nameInput).toBeFocused() // autoFocus on open

  await page.keyboard.type("Alice")
  await page.keyboard.press("Tab")
  await expect(page.getByRole("button", { name: "Continue" })).toBeFocused()

  // Tab past the last focusable element — focus must not escape to the
  // sidebar/header behind the modal (Radix Dialog's built-in focus trap).
  await page.keyboard.press("Tab")
  await expect(nameInput).toBeFocused()

  await page.getByRole("button", { name: "Continue" }).focus()
  await page.keyboard.press("Enter")
  await expect(page.getByText("Welcome to Task Board")).not.toBeVisible()
})

test("/tasks: add a task using only the keyboard", async ({ page }) => {
  await page.goto("/")
  await page.getByPlaceholder("Your name").fill("Alice")
  await page.getByRole("button", { name: "Continue" }).click()

  await page.getByRole("link", { name: "Tasks" }).click()
  await expect(page).toHaveURL(/\/tasks/)

  await page.getByPlaceholder("Add a task").focus()
  await page.keyboard.type("Buy milk")
  await page.keyboard.press("Enter")

  await expect(page.getByText("Buy milk")).toBeVisible()
})

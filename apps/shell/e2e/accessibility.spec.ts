import { test } from "@playwright/test"
import { checkA11y } from "./helpers/axe.helper"

test("name modal has no WCAG 2.1 AA violations", async ({ page }) => {
  await page.goto("/")
  await checkA11y(page)
})

test("/tasks has no WCAG 2.1 AA violations", async ({ page }) => {
  await page.goto("/")
  await page.getByPlaceholder("Your name").fill("Alice")
  await page.getByRole("button", { name: "Continue" }).click()
  await page.getByRole("link", { name: "Tasks" }).click()

  await checkA11y(page)
})

test("/stats has no WCAG 2.1 AA violations", async ({ page }) => {
  await page.goto("/")
  await page.getByPlaceholder("Your name").fill("Alice")
  await page.getByRole("button", { name: "Continue" }).click()
  await page.getByRole("link", { name: "Stats" }).click()

  await checkA11y(page)
})

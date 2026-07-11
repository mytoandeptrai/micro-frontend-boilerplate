import { test } from "@playwright/test"
import { checkA11y } from "./helpers/axe.helper"

test("placeholder page has no WCAG 2.1 AA violations", async ({ page }) => {
  await page.goto("/")
  await checkA11y(page)
})

import { expect, test } from "@playwright/test"

test("placeholder page renders", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { name: "Base App" })).toBeVisible()
  await expect(page.getByText("Start building your feature here.")).toBeVisible()
})

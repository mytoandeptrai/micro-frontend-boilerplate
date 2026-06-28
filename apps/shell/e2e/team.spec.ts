import { expect, test } from "@playwright/test"

test.describe("Team App via Shell", () => {
  test("loads /team and displays member table", async ({ page }) => {
    await page.goto("/team")
    await page.waitForLoadState("networkidle")
    await expect(page.getByRole("table")).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "Name" })).toBeVisible()
    await expect(
      page.getByRole("columnheader", { name: "Email" }),
    ).toBeVisible()
  })

  test("search input filters rows and updates URL", async ({ page }) => {
    await page.goto("/team")
    await page.waitForLoadState("networkidle")
    const searchInput = page.getByPlaceholder("Search name...")
    await searchInput.fill("alice")
    await page.waitForTimeout(500)
    await expect(page.url()).toContain("name=alice")
  })

  test("role filter updates URL", async ({ page }) => {
    await page.goto("/team")
    await page.waitForLoadState("networkidle")
    await page.getByRole("combobox").first().click()
    await page.getByRole("option", { name: "Admin" }).click()
    await expect(page.url()).toContain("role=admin")
  })

  test("URL params persist on reload", async ({ page }) => {
    await page.goto("/team?name=alice&role=admin&page=1")
    await page.waitForLoadState("networkidle")
    const searchInput = page.getByPlaceholder("Search name...")
    await expect(searchInput).toHaveValue("alice")
  })

  test("clicking a row navigates to MemberDetail", async ({ page }) => {
    await page.goto("/team")
    await page.waitForLoadState("networkidle")
    const rows = page
      .getByRole("row")
      .filter({ hasNot: page.getByRole("columnheader") })
    const firstRow = rows.first()
    await firstRow.waitFor({ state: "visible" })
    await firstRow.click()
    await expect(page).toHaveURL(/\/team\/.+/)
    await expect(page.getByText("Member Detail")).toBeVisible()
  })

  test("MemberDetail edit and save flow", async ({ page }) => {
    await page.goto("/team")
    await page.waitForLoadState("networkidle")
    const rows = page
      .getByRole("row")
      .filter({ hasNot: page.getByRole("columnheader") })
    await rows.first().click()
    await expect(page.getByText("Edit")).toBeVisible()
    await page.getByText("Edit").click()
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible()
    const nameInput = page.getByRole("textbox", { name: /name/i })
    await nameInput.clear()
    await nameInput.fill("Updated Name")
    await page.getByRole("button", { name: "Save" }).click()
    await expect(page.getByText("Member updated")).toBeVisible({
      timeout: 5000,
    })
  })
})

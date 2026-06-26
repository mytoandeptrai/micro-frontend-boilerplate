import { expect, test } from "@playwright/test";

test("loads at localhost:3000 and shows layout", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Ops Dashboard")).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Team" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Monitor" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
});

test("sidebar navigation - Team", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("link", { name: "Team" }).click();
  await expect(page).toHaveURL("/team");
  await expect(page.getByRole("main").getByText("Team")).toBeVisible();
});

test("sidebar navigation - Monitor", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("link", { name: "Monitor" }).click();
  await expect(page).toHaveURL("/monitor");
  await expect(page.getByRole("main").getByText("Monitor")).toBeVisible();
});

test("sidebar navigation - Settings", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page).toHaveURL("/settings");
  await expect(page.getByRole("main").getByText("Settings")).toBeVisible();
});

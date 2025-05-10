import test, { expect } from "@playwright/test";
import { createId } from "@typebot.io/lib/createId";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { getTestAsset } from "./utils/playwright";

test("should work as expected", async ({ page }) => {
  const typebotId = createId();
  await importTypebotInDatabase(getTestAsset("typebots/cards.json"), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  });
  await page.goto(`/${typebotId}-public`);
  await expect(page.getByRole("heading", { name: "Paris" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "London" })).toBeVisible();
  await page.getByRole("button", { name: "Next slide" }).click();
  await expect(page.getByRole("heading", { name: "Dublin" })).toBeVisible();
  await page.getByRole("button", { name: "Previous slide" }).click();
  await expect(page.getByRole("heading", { name: "Paris" })).toBeVisible();
  await page.getByRole("button", { name: "More info" }).nth(0).click();
  await expect(page.getByRole("img", { name: "Attached image" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Title 1" })).toBeVisible();
  await expect(page.getByText("Desc 1")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Title 2" })).toBeVisible();
  await expect(page.getByText("Desc 2")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).nth(1).click();
  await expect(page.getByText("You've selected Title 2")).toBeVisible();
});

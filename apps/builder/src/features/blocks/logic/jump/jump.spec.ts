import { getTestAsset } from "@/test/utils/playwright";
import { createId } from "@paralleldrive/cuid2";
import test, { expect } from "@playwright/test";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";

test("should work as expected", async ({ page }) => {
  const typebotId = createId();
  await importTypebotInDatabase(getTestAsset("typebots/logic/jump.json"), {
    id: typebotId,
  });

  await page.goto(`/typebots/${typebotId}/edit`);
  await page.getByText("Configure...").click();
  await page.getByPlaceholder("Select a group").click();
  await expect(page.getByRole("menuitem", { name: "Group #2" })).toBeHidden();
  await page.getByRole("menuitem", { name: "Group #1" }).click();
  await page.getByPlaceholder("Select a block").click();
  await page.getByRole("menuitem", { name: "Block #2" }).click();
  await page.getByRole("button", { name: "Test" }).click();
  await page.getByPlaceholder("Type your answer...").fill("Hi there!");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(
    page.locator("typebot-standard").getByText("How are you?").nth(1),
  ).toBeVisible();
  await expect(
    page.locator("typebot-standard").getByText("Hello this is a test!").nth(1),
  ).toBeHidden();
});

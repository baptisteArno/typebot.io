import test, { expect } from "@playwright/test";
import { createId } from "@typebot.io/lib/createId";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { getTestAsset } from "./utils/playwright";

test("should work as expected", async ({ page }) => {
  const typebotId = createId();
  await importTypebotInDatabase(getTestAsset("typebots/condition.json"), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  });
  await page.goto(`/${typebotId}-public`);
  await expect(page.getByText("How old are you?")).toBeVisible();
  await page.getByRole("spinbutton", { name: "Type a number..." }).fill("40");
  await page
    .getByRole("spinbutton", { name: "Type a number..." })
    .press("Enter");
  await expect(page.getByText("You are older than 20")).toBeVisible();

  await page.reload();
  await page.getByRole("spinbutton", { name: "Type a number..." }).fill("15");
  await page
    .getByRole("spinbutton", { name: "Type a number..." })
    .press("Enter");
  await page.waitForTimeout(3000);
  await expect(page.getByText("This should never be displayed")).toBeHidden();
});

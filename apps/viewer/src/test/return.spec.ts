import test, { expect } from "@playwright/test";
import { createId } from "@typebot.io/lib/createId";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { getTestAsset } from "./utils/playwright";

test("should work as expected", async ({ page }) => {
  const typebotId = createId();
  await importTypebotInDatabase(getTestAsset("typebots/return.json"), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  });
  await page.goto(`/${typebotId}-public`);
  await expect(page.getByText("Hey!")).toBeVisible();
  await page.getByRole("button", { name: "Hi!" }).click();
  await expect(page.getByText("What's your name?")).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Type your answer..." }),
  ).toBeVisible();
});

import test, { expect } from "@playwright/test";
import { createId } from "@typebot.io/lib/createId";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { getTestAsset } from "./utils/playwright";

test("client side exec should work", async ({ page }) => {
  const typebotId = createId();
  await importTypebotInDatabase(getTestAsset("typebots/setVariable.json"), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  });
  await page.goto(`/${typebotId}-public`);

  await expect(page.getByText("3001")).toBeVisible();
});

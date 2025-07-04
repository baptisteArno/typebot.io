import test from "@playwright/test";
import { createId } from "@typebot.io/lib/createId";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { getTestAsset } from "./utils/playwright";

test("client side exec should work", async ({ page }) => {
  const typebotId = createId();
  await importTypebotInDatabase(getTestAsset("typebots/redirect.json"), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  });
  await page.goto(`/${typebotId}-public`);
  await page.getByRole("button", { name: "Go" }).click();

  await page.waitForURL("https://www.google.com");
});

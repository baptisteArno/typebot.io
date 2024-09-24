import { getTestAsset } from "@/test/utils/playwright";
import { createId } from "@paralleldrive/cuid2";
import test, { expect } from "@playwright/test";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";

test("should correctly be injected", async ({ page }) => {
  const typebotId = createId();
  await importTypebotInDatabase(
    getTestAsset("typebots/predefinedVariables.json"),
    { id: typebotId, publicId: `${typebotId}-public` },
  );
  await page.goto(`/${typebotId}-public`);
  await expect(page.locator('text="Your name is"')).toBeVisible();
  await page.goto(`/${typebotId}-public?Name=Baptiste&Email=email@test.com`);
  await expect(page.locator('text="Baptiste"')).toBeVisible();
  await expect(page.getByPlaceholder("Type your email...")).toHaveValue(
    "email@test.com",
  );
});

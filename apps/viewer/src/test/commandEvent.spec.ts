import test, { expect } from "@playwright/test";
import { createId } from "@typebot.io/lib/createId";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { getTestAsset } from "./utils/playwright";

declare global {
  interface Window {
    Typebot: {
      sendCommand: (command: string) => void;
    };
  }
}

test("should work as expected", async ({ page }) => {
  const typebotId = createId();
  await importTypebotInDatabase(getTestAsset("typebots/commandEvent.json"), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  });
  await page.goto(`/${typebotId}-public`);

  await expect(page.getByRole("button", { name: "Hi!" })).toBeVisible();
  await page.evaluate(() => {
    window.Typebot.sendCommand("wizz");
  });
  await expect(page.getByText("Wizzzzz")).toBeVisible();
  await expect(page.getByRole("button", { name: "Hi!" })).toBeVisible();
  await page.evaluate(() => {
    window.Typebot.sendCommand("leave");
  });
  await expect(page.getByText("Leaving!")).toBeVisible();
  await expect(page.getByRole("button", { name: "Hi!" })).toBeHidden();
});

import test, { expect } from "@playwright/test";
import { createId } from "@typebot.io/lib/createId";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { getTestAsset } from "./utils/playwright";

test("should be able to resume chat after a refresh", async ({ page }) => {
  const typebotId = createId();
  await importTypebotInDatabase(getTestAsset("typebots/rememberUser.json"), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  });
  await page.goto(`/${typebotId}-public`);
  await page.getByRole("button", { name: "Hi!" }).click();
  await expect(page.getByText("What's your name?")).toBeVisible();
  await page.reload();
  await page
    .getByRole("textbox", { name: "Type your answer..." })
    .fill("Baptiste");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(
    page.getByText("Great! Nice to meet you Baptiste"),
  ).toBeVisible();
});

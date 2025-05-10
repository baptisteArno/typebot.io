import test, { expect } from "@playwright/test";
import { createId } from "@typebot.io/lib/createId";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { getTestAsset } from "./utils/playwright";

test("should work as expected", async ({ page }) => {
  const typebotId = createId();
  await importTypebotInDatabase(getTestAsset("typebots/replyEvent.json"), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  });
  await page.goto(`/${typebotId}-public`);

  await page.getByRole("button", { name: "Hi!" }).click();
  await expect(page.getByText("Hi!").nth(1)).toBeVisible();
  await expect(page.getByText("buttons")).toBeVisible();
  await expect(page.getByText("Welcome", { exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Type your answer..." }).click();
  await page
    .getByRole("textbox", { name: "Type your answer..." })
    .fill("Baptiste");
  await page
    .getByRole("textbox", { name: "Type your answer..." })
    .press("Enter");
  await expect(page.getByText("Baptiste")).toBeVisible();
  await page
    .getByRole("textbox", { name: "Type your email..." })
    .fill("baptiste@typebot.io");
  await page
    .getByRole("textbox", { name: "Type your email..." })
    .press("Enter");
  await page.waitForTimeout(3000);
  await expect(page.getByText("baptiste@typebot.io").nth(1)).toBeHidden();

  await page.reload();
  await page.getByRole("button", { name: "Hi!" }).click();
  await page
    .getByRole("textbox", { name: "Type your answer..." })
    .fill("leave");
  await page
    .getByRole("textbox", { name: "Type your answer..." })
    .press("Enter");
  await page.waitForTimeout(3000);
  await expect(
    page.getByRole("textbox", { name: "Type your answer..." }),
  ).toBeHidden();
});

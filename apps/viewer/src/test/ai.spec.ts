import test, { expect } from "@playwright/test";
import { createId } from "@typebot.io/lib/createId";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { getTestAsset } from "./utils/playwright";

test("should display AI chat completion response", async ({ page }) => {
  const typebotId = createId();
  await importTypebotInDatabase(
    getTestAsset("typebots/basic-chat-completion.json"),
    {
      id: typebotId,
      publicId: `${typebotId}-public`,
    },
  );
  await page.goto(`/${typebotId}-public`);
  await page
    .getByRole("textbox", { name: "Type your answer..." })
    .fill("In a single sentence, what can you do?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByTestId("host-bubble").nth(2)).toBeVisible();
});

import { getTestAsset } from "@/test/utils/playwright";
import { createId } from "@paralleldrive/cuid2";
import test, { expect } from "@playwright/test";
import { env } from "@typebot.io/env";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { apiToken } from "@typebot.io/playwright/databaseSetup";

const typebotId = createId();

test.describe("Wait block", () => {
  test("wait should trigger", async ({ page, request }) => {
    await importTypebotInDatabase(getTestAsset("typebots/logic/webhook.json"), {
      id: typebotId,
    });

    await page.goto(`/typebots/${typebotId}/edit`);
    await page.getByText("Listen for webhook").click();
    await page.getByRole("button", { name: "Listen for test event" }).click();
    await page.waitForTimeout(1000);
    await request.post(
      `${env.NEXT_PUBLIC_VIEWER_URL[0]}/api/v1/typebots/${typebotId}/blocks/webhook-block-id/web/executeTestWebhook`,
      {
        data: {
          name: "John",
        },
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      },
    );
    await expect(page.getByText('{ "data": { "name": "John')).toBeVisible();
    await page.getByRole("button", { name: "Save in variables" }).click();
    await page.getByRole("button", { name: "Add an entry" }).click();
    await page.getByPlaceholder("Select the data").click();
    await page.getByRole("menuitem", { name: "data.name" }).click();
    await page.getByTestId("variables-input").click();
    await page
      .getByRole("menuitem", { name: "Name Rename variable Remove" })
      .click();
    await page.getByRole("button", { name: "Test", exact: true }).click();
    await expect(
      page.locator("span").filter({ hasText: "Ok let's look into that..." }),
    ).toBeVisible();
    await page.waitForTimeout(1000);
    await request.post(
      `${env.NEXT_PUBLIC_VIEWER_URL[0]}/api/v1/typebots/${typebotId}/blocks/webhook-block-id/web/executeTestWebhook`,
      {
        data: {
          name: "John",
        },
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      },
    );
    await expect(
      page.getByText(", nice to see you again!", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("John")).toBeVisible();
  });
});

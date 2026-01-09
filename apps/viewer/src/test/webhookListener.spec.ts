import { createId } from "@paralleldrive/cuid2";
import test, { expect } from "@playwright/test";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { apiToken } from "@typebot.io/playwright/databaseSetup";
import { getTestAsset } from "@/test/utils/playwright";

test("should pause and resume on webhook call", async ({ page, request }) => {
  const typebotId = createId();
  const blockId = "k1q2uoeat8xp7easiuwr6r56";

  await importTypebotInDatabase(getTestAsset("typebots/webhookListener.json"), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  });

  const [, response] = await Promise.all([
    page.goto(`/${typebotId}-public`),
    page.waitForResponse(/startChat/),
  ]);
  const { resultId } = await response.json();

  await expect(page.getByText("Waiting for webhook...")).toBeVisible();

  await page.waitForTimeout(1000);

  const webhookResponse = await request.post(
    `/api/v1/typebots/${typebotId}/blocks/${blockId}/results/${resultId}/executeWebhook`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    },
  );
  expect(webhookResponse.ok()).toBe(true);

  await expect(page.getByText("Hurray!")).toBeVisible();
});

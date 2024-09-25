import { createId } from "@paralleldrive/cuid2";
import test from "@playwright/test";
import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import { createTypebots } from "@typebot.io/playwright/databaseActions";
import { parseDefaultGroupWithBlock } from "@typebot.io/playwright/databaseHelpers";

test.describe("Google Analytics block", () => {
  test("its configuration should work", async ({ page }) => {
    const typebotId = createId();
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultGroupWithBlock({
          type: IntegrationBlockType.GOOGLE_ANALYTICS,
        }),
      },
    ]);

    await page.goto(`/typebots/${typebotId}/edit`);
    await page.click("text=Configure...");
    await page.fill('input[placeholder="G-123456..."]', "G-VWX9WG1TNS");
    await page.fill('input[placeholder="Example: conversion"]', "conversion");
    await page.click("text=Advanced");
    await page.fill('input[placeholder="Example: Typebot"]', "Typebot");
    await page.fill('input[placeholder="Example: Campaign Z"]', "Campaign Z");
    await page.fill('input[placeholder="Example: 0"]', "0");
  });
});

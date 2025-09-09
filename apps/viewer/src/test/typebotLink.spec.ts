import test, { expect } from "@playwright/test";
import { env } from "@typebot.io/env";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import type { Prisma } from "@typebot.io/prisma/types";
import { getTestAsset } from "@/test/utils/playwright";

let publicTypebot1: Prisma.PublicTypebot;
let publicTypebot2: Prisma.PublicTypebot;
let publicTypebot1MergeDisabled: Prisma.PublicTypebot;

test.beforeAll(async () => {
  try {
    publicTypebot1 = await importTypebotInDatabase(
      getTestAsset("typebots/linkTypebots/1.json"),
    );
    publicTypebot1MergeDisabled = await importTypebotInDatabase(
      getTestAsset("typebots/linkTypebots/1-merge-disabled.json"),
    );
    publicTypebot2 = await importTypebotInDatabase(
      getTestAsset("typebots/linkTypebots/2.json"),
    );
    await importTypebotInDatabase(getTestAsset("typebots/linkTypebots/3.json"));
  } catch (err) {
    console.error(err);
  }
});

test("should work as expected", async ({ page }) => {
  await page.goto(`/${publicTypebot1.id}`);
  await page.getByPlaceholder("Type your answer...").fill("Start");
  await page.getByPlaceholder("Type your answer...").press("Enter");
  await expect(page.getByText("First test message")).toBeVisible();
  await page.getByPlaceholder("Type your answer...").fill("Hello there!");
  await page.getByPlaceholder("Type your answer...").press("Enter");
  await expect(page.getByText("Cheers!")).toBeVisible();
  await expect(page.getByText("end 3")).toBeVisible();
  await expect(page.getByText("End", { exact: true })).toBeVisible();
  await page.goto(
    `${env.NEXTAUTH_URL}/typebots/${publicTypebot1.typebotId}/results`,
  );
  await expect(page.locator("text=Hello there!")).toBeVisible();
});

test.describe("Merge disabled", () => {
  test("should work as expected", async ({ page }) => {
    await page.goto(`/${publicTypebot1MergeDisabled.id}`);
    await page.getByPlaceholder("Type your answer...").fill("Hello there!");
    await page.getByPlaceholder("Type your answer...").press("Enter");
    await expect(page.getByText("Cheers!")).toBeVisible();
    await page.goto(
      `${process.env.NEXTAUTH_URL}/typebots/${publicTypebot1MergeDisabled.typebotId}/results`,
    );
    await expect(page.locator("text=Submitted at")).toBeVisible();
    await expect(page.locator("text=Hello there!")).toBeHidden();
    await page.goto(
      `${env.NEXTAUTH_URL}/typebots/${publicTypebot2.typebotId}/results`,
    );
    await expect(page.locator("text=Hello there!")).toBeVisible();
  });
});

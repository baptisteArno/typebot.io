import { readFileSync } from "node:fs";
import { createId } from "@paralleldrive/cuid2";
import test, { expect } from "@playwright/test";
import { env } from "@typebot.io/env";
import { parseS3PublicBaseUrl } from "@typebot.io/lib/s3/parseS3PublicBaseUrl";
import { isDefined } from "@typebot.io/lib/utils";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { parse } from "papaparse";
import { getTestAsset } from "@/test/utils/playwright";

test("should work as expected", async ({ page, browser }) => {
  const typebotId = createId();
  await importTypebotInDatabase(getTestAsset("typebots/fileUpload.json"), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  });
  await page.goto(`/${typebotId}-public`);
  await page
    .locator(`input[type="file"]`)
    .setInputFiles([
      getTestAsset("typebots/api.json"),
      getTestAsset("typebots/fileUpload.json"),
      getTestAsset("typebots/hugeGroup.json"),
    ]);
  await page.locator('text="Upload 3 files"').click();
  await expect(page.locator(`text="3 files uploaded"`)).toBeVisible();
  await page.goto(`${env.NEXTAUTH_URL}/typebots/${typebotId}/results`);
  const fileLinks = page.getByRole("link", { name: /\.json/ });
  await expect(fileLinks).toHaveCount(3, { timeout: 10000 });

  await page.click('[data-slot="checkbox"] >> nth=0');
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export" }).click(),
  ]);
  const downloadPath = await download.path();
  if (!downloadPath) throw new Error("Download path not found");
  const file = readFileSync(downloadPath).toString();
  const { data } = parse(file);
  expect(data).toHaveLength(2);
  const exportedRow = data[1];
  if (!Array.isArray(exportedRow)) throw new Error("Exported row not found");
  expect(exportedRow[1]).toContain(parseS3PublicBaseUrl());

  const urls = (
    await fileLinks.evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")),
    )
  ).filter(isDefined);
  expect(urls).toHaveLength(3);

  const page2 = await browser.newPage();
  await page2.goto(urls[0]);
  await expect(page2.locator("pre")).toBeVisible();

  await page.getByRole("button", { name: "Delete" }).click();
  await page.locator('button >> text="Delete"').click();
  await expect(fileLinks).toHaveCount(0);

  await expect
    .poll(
      async () => {
        const res = await page.request.get(`${urls[0]}?_cb=${Date.now()}`, {
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
        });
        return res.status();
      },
      { timeout: 15_000, intervals: [500, 1000, 2000] },
    )
    .not.toBe(200);
});

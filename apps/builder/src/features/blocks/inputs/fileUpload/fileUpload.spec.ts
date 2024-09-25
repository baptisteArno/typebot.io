import { getTestAsset } from "@/test/utils/playwright";
import { createId } from "@paralleldrive/cuid2";
import test, { expect } from "@playwright/test";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { createTypebots } from "@typebot.io/playwright/databaseActions";
import { parseDefaultGroupWithBlock } from "@typebot.io/playwright/databaseHelpers";
import { freeWorkspaceId } from "@typebot.io/playwright/databaseSetup";

test.describe.configure({ mode: "parallel" });

test("options should work", async ({ page }) => {
  const typebotId = createId();
  await createTypebots([
    {
      id: typebotId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.FILE,
      }),
    },
  ]);

  await page.goto(`/typebots/${typebotId}/edit`);

  await page.click("text=Test");
  await expect(page.locator(`text=Click to upload`)).toBeVisible();
  await expect(page.locator(`text="Skip"`)).toBeHidden();
  await page
    .locator(`input[type="file"]`)
    .setInputFiles([getTestAsset("avatar.jpg")]);
  await expect(
    page.getByRole("img", { name: "Attached image 1" }),
  ).toBeVisible();
  await page.click('text="Collect file"');
  await page.click('text="Required?"');
  await page.click('text="Allow multiple files?"');
  await page.fill("div[contenteditable=true]", "<strong>Upload now!!</strong>");
  await page.click('text="Labels"');
  await page.fill('[value="Upload"]', "Go");
  await page.fill('[value="Clear"]', "Reset");
  await page.fill('[value="Skip"]', "Pass");
  await page.click('text="Restart"');
  await expect(page.locator(`text="Pass"`)).toBeVisible();
  await expect(page.locator(`text="Upload now!!"`)).toBeVisible();
  await page
    .locator(`input[type="file"]`)
    .setInputFiles([
      getTestAsset("avatar.jpg"),
      getTestAsset("avatar.jpg"),
      getTestAsset("avatar.jpg"),
    ]);
  await expect(page.getByRole("img", { name: "avatar.jpg" })).toHaveCount(3);
  await page.locator('text="Go"').click();
  await expect(
    page.getByRole("img", { name: "Attached image 1" }),
  ).toBeVisible();
});

test.describe("Free workspace", () => {
  test("shouldn't be able to publish typebot", async ({ page }) => {
    const typebotId = createId();
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.FILE,
        }),
        version: "6",
        workspaceId: freeWorkspaceId,
      },
    ]);
    await page.goto(`/typebots/${typebotId}/edit`);
    await page.click('text="Collect file"');
    await page.click('text="Allow multiple files?"');
    await page.click('text="Publish"');
    await expect(
      page.locator(
        'text="You need to upgrade your plan in order to use file input blocks"',
      ),
    ).toBeVisible();
  });
});

import { createId } from "@paralleldrive/cuid2";
import test, { expect } from "@playwright/test";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { createTypebots } from "@typebot.io/playwright/databaseActions";
import { parseDefaultGroupWithBlock } from "@typebot.io/playwright/databaseHelpers";

test("should not be able to submit taken url ID", async ({ page }) => {
  const takenTypebotId = createId();
  const typebotId = createId();
  await createTypebots([
    {
      id: takenTypebotId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
      }),
      publicId: "taken-url-id",
    },
  ]);
  await createTypebots([
    {
      id: typebotId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
      }),
      publicId: typebotId + "-public",
    },
  ]);
  await page.goto(`/typebots/${typebotId}/share`);
  await page.getByText(`${typebotId}-public`).click();
  await page.getByRole("textbox").fill("id with spaces");
  await page.getByRole("textbox").press("Enter");
  await expect(
    page
      .getByText("Can only contain lowercase letters, numbers and dashes.")
      .nth(0),
  ).toBeVisible();
  await page.getByText(`${typebotId}-public`).click();
  await page.getByRole("textbox").fill("taken-url-id");
  await page.getByRole("textbox").press("Enter");
  await expect(page.getByText("ID is already taken").nth(0)).toBeVisible();
  await page.getByText(`${typebotId}-public`).click();
  await page.getByRole("textbox").fill("new-valid-id");
  await page.getByRole("textbox").press("Enter");
  await expect(page.getByText("new-valid-id")).toBeVisible();
  await expect(page.getByText(`${typebotId}-public`)).toBeHidden();
});

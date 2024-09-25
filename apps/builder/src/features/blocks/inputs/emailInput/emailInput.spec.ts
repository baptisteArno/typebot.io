import { createId } from "@paralleldrive/cuid2";
import test, { expect } from "@playwright/test";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { defaultEmailInputOptions } from "@typebot.io/blocks-inputs/email/constants";
import { createTypebots } from "@typebot.io/playwright/databaseActions";
import { parseDefaultGroupWithBlock } from "@typebot.io/playwright/databaseHelpers";

test.describe("Email input block", () => {
  test("options should work", async ({ page }) => {
    const typebotId = createId();
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.EMAIL,
        }),
      },
    ]);

    await page.goto(`/typebots/${typebotId}/edit`);

    await page.click("text=Test");
    await expect(
      page.locator(
        `input[placeholder="${defaultEmailInputOptions.labels.placeholder}"]`,
      ),
    ).toHaveAttribute("type", "email");

    await page.click(`text=${defaultEmailInputOptions.labels.placeholder}`);
    await page.fill(
      `input[value="${defaultEmailInputOptions.labels.placeholder}"]`,
      "Your email...",
    );
    await expect(page.locator("text=Your email...")).toBeVisible();
    await page.getByLabel("Button label:").fill("Go");
    await page.fill(
      `input[value="${defaultEmailInputOptions.retryMessageContent}"]`,
      "Try again bro",
    );

    await page.click("text=Restart");
    await page.locator(`input[placeholder="Your email..."]`).fill("test@test");
    await page.getByRole("button", { name: "Go" }).click();
    await expect(page.locator("text=Try again bro")).toBeVisible();
    await page
      .locator(`input[placeholder="Your email..."]`)
      .fill("test@test.com");
    await page.getByRole("button", { name: "Go" }).click();
    await expect(page.locator("text=test@test.com")).toBeVisible();
  });
});

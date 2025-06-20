import { createId } from "@paralleldrive/cuid2";
import test, { expect } from "@playwright/test";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { defaultEmailInputOptions } from "@typebot.io/blocks-inputs/email/constants";
import { createTypebots } from "@typebot.io/playwright/databaseActions";
import { parseDefaultGroupWithBlock } from "@typebot.io/playwright/databaseHelpers";

test.describe("Email input block", () => {
  test("basic options should work", async ({ page }) => {
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

  test("keyboard navigation should work", async ({ page }) => {
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

    // Test Enter key submission
    await page
      .locator(
        `input[placeholder="${defaultEmailInputOptions.labels.placeholder}"]`,
      )
      .fill("valid@email.com");
    await page.keyboard.press("Enter");
    await expect(page.locator("text=valid@email.com")).toBeVisible();
  });

  test("empty input validation should work", async ({ page }) => {
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

    // Try submitting an empty field
    await page
      .getByRole("button", { name: defaultEmailInputOptions.labels.button })
      .click();
    // Should stay on the same input as nothing happens with empty input
    await expect(
      page.locator(
        `input[placeholder="${defaultEmailInputOptions.labels.placeholder}"]`,
      ),
    ).toBeVisible();

    // Now test with a valid email to ensure it moves forward
    await page
      .locator(
        `input[placeholder="${defaultEmailInputOptions.labels.placeholder}"]`,
      )
      .fill("valid@email.com");
    await page
      .getByRole("button", { name: defaultEmailInputOptions.labels.button })
      .click();
    await expect(page.locator("text=valid@email.com")).toBeVisible();
  });

  test("special character emails should be validated correctly", async ({
    page,
  }) => {
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

    // Test with special characters in email
    await page
      .locator(
        `input[placeholder="${defaultEmailInputOptions.labels.placeholder}"]`,
      )
      .fill("user+tag@domain.co.uk");
    await page
      .getByRole("button", { name: defaultEmailInputOptions.labels.button })
      .click();
    await expect(page.locator("text=user+tag@domain.co.uk")).toBeVisible();

    // Restart and try another complex but valid email
    await page.click("text=Restart");
    await page
      .locator(
        `input[placeholder="${defaultEmailInputOptions.labels.placeholder}"]`,
      )
      .fill("very.unusual.email@domain-with-hyphens.co.uk");
    await page
      .getByRole("button", { name: defaultEmailInputOptions.labels.button })
      .click();
    await expect(
      page.locator("text=very.unusual.email@domain-with-hyphens.co.uk"),
    ).toBeVisible();
  });
});

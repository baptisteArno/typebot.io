import { createId } from "@paralleldrive/cuid2";
import test, { expect } from "@playwright/test";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { createTypebots } from "@typebot.io/playwright/databaseActions";
import { parseDefaultGroupWithBlock } from "@typebot.io/playwright/databaseHelpers";

const firstImageSrc =
  "https://images.unsplash.com/flagged/photo-1575517111839-3a3843ee7f5d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80";

const secondImageSrc =
  "https://images.unsplash.com/photo-1582582621959-48d27397dc69?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2938&q=80";

const thirdImageSrc =
  "https://images.unsplash.com/photo-1564019472231-4586c552dc27?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1287&q=80";

test.describe
  .parallel("Picture choice input block", () => {
    test("can edit items", async ({ page }) => {
      const typebotId = createId();
      await createTypebots([
        {
          id: typebotId,
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.PICTURE_CHOICE,
            items: [
              {
                id: "choice1",
              },
            ],
          }),
        },
      ]);

      await page.goto(`/typebots/${typebotId}/edit`);
      await page.getByTestId("item-node").click();
      await page.getByRole("button", { name: "Pick an image" }).click();
      await page
        .getByPlaceholder("Paste the image link...")
        .fill(firstImageSrc);
      await page.getByLabel("Title:").fill("First image");
      await page.getByLabel("Description:").fill("First description");
      await page.getByText("Default").click();
      await page.getByRole("img", { name: "Picture choice image" }).hover();
      await page.getByRole("button", { name: "Add item" }).click();
      await page.getByTestId("item-node").last().click();
      await page.getByRole("button", { name: "Pick an image" }).click();
      await page
        .getByPlaceholder("Paste the image link...")
        .fill(secondImageSrc);
      await page.getByLabel("Title:").fill("Second image");
      await page.getByLabel("Description:").fill("Second description");
      await page
        .getByRole("img", { name: "Picture choice image" })
        .last()
        .hover();
      await page.getByRole("button", { name: "Add item" }).click();
      await page.getByTestId("item-node").last().click();
      await expect(
        page.getByRole("button", { name: "Pick an image" }),
      ).toHaveCount(1);
      await page.getByRole("button", { name: "Pick an image" }).click();
      await page
        .getByPlaceholder("Paste the image link...")
        .fill(thirdImageSrc);
      await page.getByLabel("Title:").fill("Third image");
      await page.getByLabel("Description:").fill("Third description");
      await page.getByRole("button", { name: "Test" }).click();
      await expect(
        page.getByRole("button", {
          name: "First image First image First description",
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", {
          name: "Second image Second image Second description",
        }),
      ).toBeVisible();
      await page
        .getByRole("button", {
          name: "Third image Third image Third description",
        })
        .click();
      await expect(page.getByTestId("guest-bubble")).toBeVisible();
      await expect(
        page.locator("typebot-standard").getByText("Third image"),
      ).toBeVisible();

      await page
        .getByTestId("block block2")
        .click({ position: { x: 0, y: 0 } });
      await page.getByText("Multiple choice?").click();
      await page.getByLabel("Submit button label:").fill("Go");
      await page.getByRole("button", { name: "Restart" }).click();
      await page
        .getByRole("checkbox", {
          name: "First image First image First description",
        })
        .click();
      await page
        .getByRole("checkbox", {
          name: "Second image Second image Second description",
        })
        .click();
      await page.getByRole("button", { name: "Go" }).click();
      await expect(
        page.locator("typebot-standard").getByText("First image, Second image"),
      ).toBeVisible();

      await page
        .getByTestId("block block2")
        .click({ position: { x: 0, y: 0 } });
      await page.getByText("Is searchable?").click();
      await page.getByLabel("Input placeholder:").fill("Search...");
      await page.getByRole("button", { name: "Restart" }).click();
      await page.getByPlaceholder("Search...").fill("second");
      await expect(
        page.getByRole("checkbox", {
          name: "First image First image First description",
        }),
      ).toBeHidden();
      await page
        .getByRole("checkbox", {
          name: "Second image Second image Second description",
        })
        .click();
      await page.getByRole("button", { name: "Go" }).click();
      await expect(
        page.locator("typebot-standard").getByText("Second image"),
      ).toBeVisible();
    });
  });

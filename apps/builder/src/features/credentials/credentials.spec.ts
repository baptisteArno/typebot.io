import { expect, test } from "@playwright/test";

test("should be able to create, update and delete credentials", async ({
  page,
}) => {
  await page.goto("/typebots");
  await page.click("text=Settings & Members");
  await page.click("text=Credentials");

  // Create
  await page.getByRole("button", { name: "Create new" }).click();
  await page.getByRole("menuitem", { name: "OpenAI" }).click();
  await page.getByPlaceholder("My account").fill("Typebot");
  await page.getByPlaceholder("sk-").fill("sk-test");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByTestId("openai").getByText("Typebot")).toBeVisible();

  // Edit
  await page.pause();
  await page
    .getByTestId("openai")
    .getByRole("button", { name: "Edit" })
    .click();
  await expect(page.getByPlaceholder("My account")).toHaveValue("Typebot");
  await expect(page.getByPlaceholder("sk-")).toHaveValue("sk-test");
  await page.getByPlaceholder("sk-").fill("sk-test-2");
  await page.getByPlaceholder("My account").fill("Typebot 2");
  await page.getByRole("button", { name: "Update" }).click();
  await expect(page.getByTestId("openai").getByText("Typebot 2")).toBeVisible();

  // Delete
  await page
    .getByTestId("openai")
    .getByRole("button", { name: "Delete" })
    .click();
  await page
    .getByTestId("openai")
    .getByRole("button", { name: "Delete" })
    .nth(1)
    .click();
  await expect(page.getByTestId("openai").getByText("Typebot 2")).toBeHidden();
});

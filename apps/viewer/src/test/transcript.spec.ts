import { createId } from "@paralleldrive/cuid2";
import test, { expect } from "@playwright/test";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { getTestAsset } from "./utils/playwright";

test("Transcript set variable should be correctly computed", async ({
  page,
}) => {
  const typebotId = createId();
  await importTypebotInDatabase(getTestAsset("typebots/transcript.json"), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  });

  await page.goto(`/${typebotId}-public`);
  await page.getByPlaceholder("Type your answer...").fill("hey");
  await page.getByLabel("Send").click();
  await expect(page.getByTestId("guest-bubble").getByText("hey")).toBeVisible();
  await page.getByPlaceholder("Type your answer...").fill("hey 2");
  await page.getByLabel("Send").click();
  await expect(
    page.getByTestId("guest-bubble").getByText("hey 2"),
  ).toBeVisible();
  await page.getByPlaceholder("Type your answer...").fill("hey 3");
  await page.getByLabel("Send").click();
  await expect(
    page.getByTestId("guest-bubble").getByText("hey 3"),
  ).toBeVisible();
  await expect(
    page.getByText('Assistant: "How are you? You said "'),
  ).toBeVisible();
  await expect(
    page.getByText('Assistant: "How are you? You said hey"'),
  ).toBeVisible();
  await expect(
    page.getByText('Assistant: "How are you? You said hey 2"'),
  ).toBeVisible();
  await expect(
    page.getByText('Assistant: "Let me think..."', { exact: true }).nth(0),
  ).toBeVisible();
  await expect(
    page.getByText('Assistant: "Let me think..."', { exact: true }).nth(1),
  ).toBeVisible();
  await expect(
    page.getByText('Assistant: "Let me think..."', { exact: true }).nth(2),
  ).toBeVisible();
  await expect(
    page.getByText('Assistant: "How are you? You said "', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Assistant: "How are you? You said hey"', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Assistant: "How are you? You said hey 2"', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('User: "hey"', { exact: true })).toBeVisible();
  await expect(page.getByText('User: "hey 2"', { exact: true })).toBeVisible();
  await expect(page.getByText('User: "hey 3"', { exact: true })).toBeVisible();
});

test("Transcript set variable should work in loop example", async ({
  page,
}) => {
  const typebotId = createId();
  await importTypebotInDatabase(getTestAsset("typebots/transcript-2.json"), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  });
  await page.goto(`/${typebotId}-public`);
  await expect(
    page.getByText('Assistant: "Hi there 👋"', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Assistant: "How can I help?"', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Assistant: "How can I help?"', { exact: true }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Type your answer..." }).fill("Hey");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText('Assistant: "Assistant: "Hi')).toBeVisible();
  await expect(page.getByText('User: "Hey"', { exact: true })).toBeVisible();
});

import { createId } from "@paralleldrive/cuid2";
import test, { expect } from "@playwright/test";
import type { SmtpCredentials } from "@typebot.io/credentials/schemas";
import { env } from "@typebot.io/env";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { createSmtpCredentials } from "./utils/databaseActions";
import { getTestAsset } from "./utils/playwright";

export const mockSmtpCredentials: SmtpCredentials["data"] = {
  from: {
    email: "hilda63@ethereal.email",
    name: "Hilda Leannon",
  },
  host: "smtp.ethereal.email",
  port: 587,
  username: "hilda63@ethereal.email",
  password: "YssTmWSVpubnnSacuy",
};

test.beforeAll(async () => {
  try {
    const credentialsId = "send-email-credentials";
    await createSmtpCredentials(credentialsId, mockSmtpCredentials);
  } catch (err) {
    console.error(err);
  }
});

test("should send an email", async ({ page }) => {
  const typebotId = createId();
  await importTypebotInDatabase(getTestAsset("typebots/sendEmail.json"), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  });
  await page.goto(`/${typebotId}-public`);
  await page.locator("text=Send email").click();
  await expect(page.getByText("Email sent!")).toBeVisible();
  await page.goto(`${env.NEXTAUTH_URL}/typebots/${typebotId}/results`);
  await page.click('text="See logs"');
  await expect(page.locator('text="Email successfully sent"')).toBeVisible();
});

import { createId } from "@paralleldrive/cuid2";
import test, { expect } from "@playwright/test";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { getTestAsset } from "./utils/playwright";

test("Payment redirection should work", async ({ page }) => {
  const typebotId = createId();
  await importTypebotInDatabase(getTestAsset("typebots/payment.json"), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  });
  await page.goto(`/${typebotId}-public`);
  const paypalButton = page
    .frameLocator('iframe[title="Secure payment input frame"]')
    .getByTestId("paypal");
  await expect(paypalButton).toBeVisible();
  await page.waitForTimeout(1000);
  await paypalButton.click();
  await page.getByRole("button", { name: "Pay $" }).click();
  await page.getByRole("link", { name: "Authorize Test Payment" }).click();
  await expect(page.getByText("Thank you!")).toBeVisible();
});

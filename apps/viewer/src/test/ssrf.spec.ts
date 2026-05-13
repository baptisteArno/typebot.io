import { createId } from "@paralleldrive/cuid2";
import test, { expect } from "@playwright/test";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { getTestAsset } from "@/test/utils/playwright";

test.describe("SSRF protection", () => {
  test("should block requests to private IPs and metadata endpoints", async ({
    page,
  }) => {
    const typebotId = createId();
    await importTypebotInDatabase(getTestAsset("typebots/ssrf-test.json"), {
      id: typebotId,
      publicId: `${typebotId}-public`,
    });
    await page.goto(`/${typebotId}-public`);

    // Test 1: Block AWS metadata endpoint
    await page
      .locator('[placeholder="https://example.com"]')
      .fill("http://169.254.169.254/latest/meta-data/");
    await page.locator('text="Fetch"').click();
    await expect(page.getByText("Status:")).toBeVisible({ timeout: 10000 });
    // The request should fail — status should not be 200
    await expect(page.getByText("Status: 200")).not.toBeVisible();

    // Test 2: Block private IP
    await page
      .locator('[placeholder="https://example.com"]')
      .fill("http://10.0.0.1/internal");
    await page.locator('text="Fetch"').click();
    await expect(page.getByText("Status:").nth(1)).toBeVisible({
      timeout: 10000,
    });

    // Test 3: Block localhost
    await page
      .locator('[placeholder="https://example.com"]')
      .fill("http://127.0.0.1:3000/api/auth/session");
    await page.locator('text="Fetch"').click();
    await expect(page.getByText("Status:").nth(2)).toBeVisible({
      timeout: 10000,
    });

    // Verify in logs that all requests were blocked
    await page.goto(`http://localhost:3000/typebots/${typebotId}/results`);
    await page.click('text="See logs"');
    await expect(
      page.locator('text="Webhook returned an error."').first(),
    ).toBeVisible();
  });

  test("should allow requests to public URLs", async ({ page }) => {
    const typebotId = createId();
    await importTypebotInDatabase(getTestAsset("typebots/ssrf-test.json"), {
      id: typebotId,
      publicId: `${typebotId}-public`,
    });
    await page.goto(`/${typebotId}-public`);

    await page
      .locator('[placeholder="https://example.com"]')
      .fill("https://httpbin.org/get");
    await page.locator('text="Fetch"').click();
    await expect(page.getByText("Status: 200")).toBeVisible({
      timeout: 15000,
    });
  });
});

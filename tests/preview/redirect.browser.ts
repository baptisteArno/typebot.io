import { expect, test } from "@playwright/test";
import type { executeRedirect } from "../../packages/embeds/js/src/features/blocks/logic/redirect/utils/executeRedirect";

declare global {
  interface Window {
    executeRedirect: typeof executeRedirect;
  }
}

for (const isNewTab of [false, true]) {
  for (const popupBlocked of [false, true]) {
    test(`preview redirect: isNewTab=${isNewTab}, popupBlocked=${popupBlocked}`, async ({
      page,
    }) => {
      await page.goto("/");
      const frame = page.frameLocator("iframe");
      await expect(frame.getByPlaceholder("Your answer")).toBeVisible();
      const previewFrame = page
        .frames()
        .find((frame) => frame.url().includes("/__preview"));
      if (!previewFrame) throw new Error("Missing preview frame");
      const previewUrl = previewFrame.url();
      if (popupBlocked)
        await previewFrame.evaluate(() => {
          window.open = () => null;
        });
      await frame
        .getByPlaceholder("Your answer")
        .fill(isNewTab ? "redirect-new-tab" : "redirect");
      const popupPromise = page.waitForEvent("popup");
      await frame.getByRole("button", { name: "Send", exact: true }).click();
      if (popupBlocked) {
        const fallback = frame.getByRole("link");
        await expect(fallback).toHaveAttribute(
          "href",
          "http://127.0.0.1:5199/public",
        );
        await fallback.click();
      }
      const popup = await popupPromise;
      await expect(popup).toHaveURL("http://127.0.0.1:5199/public");
      await expect(popup.locator("body")).toHaveText("network-ok");
      expect(page.url()).toBe("http://localhost:5198/");
      expect(previewFrame.isDetached()).toBe(false);
      expect(previewFrame.url()).toBe(previewUrl);
      await expect(frame.locator("body")).toHaveAttribute(
        "data-executions",
        "1",
      );
      await popup.close();
    });
  }

  test(`published redirect preserves ${isNewTab ? "_blank" : "_top"}`, async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.frameLocator("iframe").getByPlaceholder("Your answer"),
    ).toBeVisible();
    const popupPromise = isNewTab ? page.waitForEvent("popup") : undefined;
    await page.evaluate((isNewTab) => {
      window.executeRedirect(
        { url: "http://127.0.0.1:5199/public", isNewTab },
        { isPreview: false },
      );
    }, isNewTab);
    if (popupPromise) {
      const popup = await popupPromise;
      await expect(popup).toHaveURL("http://127.0.0.1:5199/public");
      expect(page.url()).toBe("http://localhost:5198/");
      await popup.close();
    } else {
      await expect(page).toHaveURL("http://127.0.0.1:5199/public");
    }
  });
}

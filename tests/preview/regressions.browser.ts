import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { parsePaymentInProgress } from "../../packages/chat-api/src/parsePaymentInProgress";

test("preview preserves the published bot's remembered state", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (location.origin === "http://127.0.0.1:5199")
      localStorage.setItem(
        "typebot-fixture-remembered",
        "published conversation",
      );
  });
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute("data-input", "answer");
  await expect(page.frameLocator("iframe").locator("body")).toHaveAttribute(
    "data-executed",
    "http://127.0.0.1:5199",
  );
  expect(
    await page
      .frameLocator("iframe")
      .locator("body")
      .evaluate(() => localStorage.getItem("typebot-fixture-remembered")),
  ).toBe("published conversation");
});

test("published embed stays below its bundle budget without Zod", async () => {
  const bundle = await readFile("packages/embeds/js/dist/web.js");
  expect(bundle.byteLength).toBeLessThanOrEqual(720_000);
  expect(bundle.toString()).not.toContain("ZodError");
});

for (const value of [
  null,
  "{",
  "null",
  "[]",
  "{}",
  JSON.stringify({ sessionId: 42 }),
  JSON.stringify({ sessionId: "session", typebot: null }),
  JSON.stringify({
    sessionId: "session",
    typebot: { id: "bot", version: "6.1", theme: [], settings: {} },
  }),
  JSON.stringify({
    sessionId: "session",
    typebot: { id: "bot", version: "6.1", theme: {}, settings: {} },
    isPreview: "true",
  }),
])
  test(`rejects malformed payment storage ${JSON.stringify(value)}`, () => {
    expect(parsePaymentInProgress(value)).toBeUndefined();
  });

test("payment storage preserves routing fields and omits unrelated fields", () => {
  const state = {
    sessionId: "session",
    resultId: "result",
    previewWebhookRoom: "room",
    isPreview: true,
    typebot: { id: "bot", version: "6.1", theme: {}, settings: {} },
  };
  expect(
    parsePaymentInProgress(JSON.stringify({ ...state, messages: ["stale"] })),
  ).toEqual(state);
});

test("preview handshake works without secure-context randomUUID", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(crypto, "randomUUID", { value: undefined });
  });
  await page.goto("/");
  await expect(
    page.frameLocator("iframe").getByPlaceholder("Your answer"),
  ).toBeVisible();
  await expect(page.locator("body")).toHaveAttribute("data-input", "answer");
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await expect(
    page.frameLocator("iframe").getByPlaceholder("Your answer"),
  ).toBeVisible();
});

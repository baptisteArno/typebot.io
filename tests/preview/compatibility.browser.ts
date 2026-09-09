import { expect, test } from "@playwright/test";
import type { StartChatResponse } from "../../packages/chat-api/src/schemas";
import type { startChatQuery } from "../../packages/embeds/js/src/queries/startChatQuery";

declare global {
  interface Window {
    paymentInitialReply?: StartChatResponse;
    startChatQuery: typeof startChatQuery;
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    window.addEventListener("message", (event) => {
      if (event.data?.type === "typebot-preview:init")
        window.paymentInitialReply = event.data.initialChatReply;
    }),
  );
  await page.goto("/");
  await expect(
    page.frameLocator("iframe").getByPlaceholder("Your answer"),
  ).toBeVisible();
});

test("delegates autoplay and fullscreen to the viewer document", async ({
  page,
}) => {
  const frame = page
    .frames()
    .find((frame) => frame.url().includes("/__preview"));
  if (!frame) throw new Error("Missing preview");
  expect(
    await frame.evaluate(() => ({
      autoplay: Reflect.get(document, "featurePolicy").allowsFeature(
        "autoplay",
      ),
      fullscreen: document.fullscreenEnabled,
    })),
  ).toEqual({ autoplay: true, fullscreen: true });
});

for (const isPreview of [false, true])
  test(`payment resume retains ${isPreview ? "preview webhook" : "published result"} routing`, async ({
    page,
  }) => {
    const frame = page
      .frames()
      .find((frame) => frame.url().includes("/__preview"));
    if (!frame) throw new Error("Missing preview");
    expect(
      await frame.evaluate(async (isPreview) => {
        if (!window.paymentInitialReply)
          throw new Error("Missing initial reply");
        sessionStorage.setItem(
          "typebotPaymentInProgress",
          JSON.stringify({
            sessionId: "payment-session",
            typebot: window.paymentInitialReply.typebot,
            resultId: isPreview ? undefined : "published-result",
            previewWebhookRoom: isPreview
              ? "owner/fixture/webhooks"
              : undefined,
            // Exercise legacy storage, which has no isPreview field.
          }),
        );
        const response = await window.startChatQuery({
          typebot: isPreview ? "fixture" : "different-public-id",
          isPreview,
          apiHost: location.origin,
          stripeRedirectStatus: "succeeded",
          initialChatReply: isPreview ? window.paymentInitialReply : undefined,
        });
        return {
          sessionId: response.data?.sessionId,
          resultId: response.data?.resultId,
          previewWebhookRoom: response.data?.previewWebhookRoom,
        };
      }, isPreview),
    ).toEqual({
      sessionId: "payment-session",
      resultId: isPreview ? undefined : "published-result",
      previewWebhookRoom: isPreview ? "owner/fixture/webhooks" : undefined,
    });
  });

for (const status of ["succeeded", "failed"])
  test(`resumes the existing payment session after a ${status} redirect without restarting`, async ({
    page,
  }) => {
    const frame = page
      .frames()
      .find((frame) => frame.url().includes("/__preview"));
    if (!frame) throw new Error("Missing preview");
    const sessionId = await frame.evaluate(() => {
      if (!window.paymentInitialReply) throw new Error("Missing initial reply");
      const { sessionId, resultId, typebot, previewWebhookRoom } =
        window.paymentInitialReply;
      sessionStorage.setItem(
        "typebotPaymentInProgress",
        JSON.stringify({
          sessionId,
          resultId,
          typebot,
          previewWebhookRoom,
          isPreview: true,
        }),
      );
      return sessionId;
    });
    const starts = await page.evaluate(() =>
      fetch("/counts")
        .then((response) => response.json())
        .then((counts) => counts.starts),
    );
    await page.route(`**/api/v1/sessions/${sessionId}/continueChat`, (route) =>
      route.fulfill({
        json: {
          messages: [],
          input: {
            id: "after-payment",
            type: "text input",
            options: {
              labels: { placeholder: "After payment", button: "Send" },
            },
          },
        },
      }),
    );
    const resumed = page.waitForRequest((request) =>
      request.url().includes(`/sessions/${sessionId}/continueChat`),
    );
    await frame.goto(
      `http://127.0.0.1:5199/__preview?redirect_status=${status}`,
    );
    expect((await resumed).postDataJSON()).toEqual({
      message: status === "failed" ? "fail" : "Success",
    });
    await expect(
      page.frameLocator("iframe").getByPlaceholder("After payment"),
    ).toBeVisible();
    await expect(page.locator("body")).toHaveAttribute(
      "data-input",
      "after-payment",
    );
    expect(
      await page.evaluate(() =>
        fetch("/counts")
          .then((response) => response.json())
          .then((counts) => counts.starts),
      ),
    ).toBe(starts);
    expect(
      await frame.evaluate(() =>
        sessionStorage.getItem("typebotPaymentInProgress"),
      ),
    ).toBeNull();
    expect(
      await frame.locator("body").getAttribute("data-executed"),
    ).toBeNull();
    const continued = page.waitForRequest((request) =>
      request.url().includes(`/sessions/${sessionId}/continueChat`),
    );
    await page
      .frameLocator("iframe")
      .getByPlaceholder("After payment")
      .fill("still the same session");
    await page
      .frameLocator("iframe")
      .getByRole("button", { name: "Send", exact: true })
      .click();
    expect((await continued).postDataJSON()).toMatchObject({
      message: { type: "text", text: "still the same session" },
    });
  });

for (const storedState of ["malformed", "another-bot", "published-session"])
  test(`ignores ${storedState} payment storage without breaking preview`, async ({
    page,
  }) => {
    const frame = page
      .frames()
      .find((frame) => frame.url().includes("/__preview"));
    if (!frame) throw new Error("Missing preview");
    await frame.evaluate((storedState) => {
      if (!window.paymentInitialReply) throw new Error("Missing initial reply");
      sessionStorage.setItem(
        "typebotPaymentInProgress",
        storedState === "malformed"
          ? "{"
          : JSON.stringify({
              ...window.paymentInitialReply,
              sessionId: "unrelated-session",
              typebot: {
                ...window.paymentInitialReply.typebot,
                id:
                  storedState === "another-bot"
                    ? "another-bot"
                    : window.paymentInitialReply.typebot.id,
              },
              isPreview: storedState !== "published-session",
            }),
      );
    }, storedState);
    const unexpectedRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/continueChat"))
        unexpectedRequests.push(request.url());
    });
    await frame.goto(
      "http://127.0.0.1:5199/__preview?redirect_status=succeeded",
    );
    await expect(
      page.frameLocator("iframe").getByPlaceholder("Your answer"),
    ).toBeVisible();
    expect(unexpectedRequests).toEqual([]);
  });

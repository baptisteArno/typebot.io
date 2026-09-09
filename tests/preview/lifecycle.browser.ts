import { expect, type Page, test } from "@playwright/test";

declare global {
  interface Window {
    previewDocumentIds: string[];
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.previewDocumentIds = [];
    window.addEventListener("message", (event: MessageEvent<unknown>) => {
      const message = event.data;
      if (
        typeof message === "object" &&
        message !== null &&
        "type" in message &&
        message.type === "typebot-preview:ready" &&
        "documentId" in message &&
        typeof message.documentId === "string"
      )
        window.previewDocumentIds.push(message.documentId);
    });
  });
});

test("server-side execution may outlast the frame connection timeout", async ({
  page,
}) => {
  await page.clock.install();
  const requested = Promise.withResolvers<void>();
  const release = Promise.withResolvers<void>();
  await page.route("**/preview/startChat", async (route) => {
    const response = await route.fetch();
    requested.resolve();
    await release.promise;
    await route.fulfill({ response });
  });
  await page.goto("/");
  await requested.promise;
  await page.clock.fastForward(60_000);
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.frameLocator("iframe").locator("body")).toBeEmpty();
  release.resolve();
  await expect(
    page.frameLocator("iframe").getByPlaceholder("Your answer"),
  ).toBeVisible();
});

test("a reloaded frame starts a fresh session and ignores stale messages", async ({
  page,
}) => {
  const sessions: string[] = [];
  await page.route("**/preview/startChat", async (route) => {
    const response = await route.fetch();
    sessions.push((await response.json()).sessionId);
    await route.fulfill({ response });
  });
  await page.goto("/");
  await page.frameLocator("iframe").getByPlaceholder("Your answer").waitFor();
  const oldDocumentId = await getPreviewDocumentId(page);
  const frame = page
    .frames()
    .find((frame) => frame.url().includes("/__preview"));
  if (!frame) throw new Error("Missing preview frame");
  await frame.goto(frame.url());
  await page.frameLocator("iframe").getByPlaceholder("Your answer").waitFor();
  expect(await getPreviewDocumentId(page)).not.toBe(oldDocumentId);
  expect(sessions).toHaveLength(2);
  expect(new Set(sessions).size).toBe(2);
  await frame.evaluate((documentId) => {
    parent.postMessage(
      { type: "typebot-preview:input", documentId, blockId: "obsolete" },
      "http://localhost:5198",
    );
    parent.postMessage(
      {
        type: "typebot-preview:logs",
        documentId,
        logs: [{ description: "obsolete" }],
      },
      "http://localhost:5198",
    );
  }, oldDocumentId);
  await expect(page.locator("body")).toHaveAttribute("data-input", "answer");
  await expect(page.locator("body")).not.toHaveAttribute("data-logs");
});

for (const action of ["restart", "reload"])
  test(`${action} during start ignores the old response`, async ({ page }) => {
    const requested = Promise.withResolvers<void>();
    const release = Promise.withResolvers<void>();
    const delivered = Promise.withResolvers<void>();
    let calls = 0;
    await page.route("**/preview/startChat", async (route) => {
      const isFirstRequest = ++calls === 1;
      const response = await route.fetch();
      if (isFirstRequest) {
        requested.resolve();
        await release.promise;
        const body = await response.json();
        body.input.options.labels.placeholder = "Obsolete answer";
        await route.fulfill({ response, json: body });
        delivered.resolve();
      } else await route.fulfill({ response });
    });
    await page.goto("/");
    await requested.promise;
    if (action === "restart")
      await page.getByRole("button", { name: "Restart", exact: true }).click();
    else {
      const frame = page
        .frames()
        .find((frame) => frame.url().includes("/__preview"));
      if (!frame) throw new Error("Missing preview frame");
      await frame.goto(frame.url());
    }
    await page.frameLocator("iframe").getByPlaceholder("Your answer").waitFor();
    release.resolve();
    await delivered.promise;
    await expect(
      page.frameLocator("iframe").getByPlaceholder("Obsolete answer"),
    ).toHaveCount(0);
    await expect(page.frameLocator("iframe").locator("body")).toHaveAttribute(
      "data-executions",
      "1",
    );
    expect(calls).toBe(2);
  });

test("duplicate ready and init messages cannot start the bot twice", async ({
  page,
}) => {
  const starts: unknown[] = [];
  await page.route("**/preview/startChat", async (route) => {
    const response = await route.fetch();
    starts.push(await response.json());
    await route.fulfill({ response });
  });
  await page.goto("/");
  await page.frameLocator("iframe").getByPlaceholder("Your answer").waitFor();
  const documentId = await getPreviewDocumentId(page);
  const frame = page
    .frames()
    .find((frame) => frame.url().includes("/__preview"));
  if (!frame) throw new Error("Missing preview frame");
  await frame.evaluate((documentId) => {
    for (let i = 0; i < 2; i++)
      parent.postMessage(
        { type: "typebot-preview:ready", documentId },
        "http://localhost:5198",
      );
  }, documentId);
  await page.evaluate(
    ({ documentId, initialChatReply }) => {
      document
        .querySelector("iframe")
        ?.contentWindow?.postMessage(
          { type: "typebot-preview:init", documentId, initialChatReply },
          "http://127.0.0.1:5199",
        );
    },
    { documentId, initialChatReply: starts[0] },
  );
  await expect(page.frameLocator("iframe").locator("body")).toHaveAttribute(
    "data-executions",
    "1",
  );
  expect(starts).toHaveLength(1);
});

test("an HTTP failure can retry with a new document", async ({ page }) => {
  await page.route(
    "**/preview/startChat",
    (route) => route.fulfill({ status: 500, body: "failed" }),
    { times: 1 },
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "Could not start preview",
  );
  const documentId = await getPreviewDocumentId(page);
  await page.getByRole("button", { name: "Retry preview" }).click();
  await expect(
    page.frameLocator("iframe").getByPlaceholder("Your answer"),
  ).toBeVisible();
  expect(await getPreviewDocumentId(page)).not.toBe(documentId);
});

test("all logs survive batching on start and continuation", async ({
  page,
}) => {
  await page.route("**/preview/startChat", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      json: {
        ...(await response.json()),
        logs: Array.from({ length: 201 }, (_, i) => ({
          description: `start ${i}`,
        })),
      },
    });
  });
  await page.route("**/continueChat", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      json: {
        ...(await response.json()),
        logs: Array.from({ length: 101 }, (_, i) => ({
          description: `continue ${i}`,
        })),
      },
    });
  });
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute("data-logs", /start 200/);
  await page
    .frameLocator("iframe")
    .getByPlaceholder("Your answer")
    .fill("hello");
  await page
    .frameLocator("iframe")
    .getByRole("button", { name: "Send", exact: true })
    .click();
  await expect(page.locator("body")).toHaveAttribute(
    "data-logs",
    /continue 100/,
  );
  expect(
    JSON.parse((await page.locator("body").getAttribute("data-logs")) ?? "[]"),
  ).toEqual([
    ...Array.from({ length: 201 }, (_, i) => ({ description: `start ${i}` })),
    ...Array.from({ length: 101 }, (_, i) => ({
      description: `continue ${i}`,
    })),
  ]);
});

for (const mode of ["preview", "legacy", "published"])
  test(`webhook replies resume the correct ${mode} session`, async ({
    page,
  }) => {
    const connected = Promise.withResolvers<string>();
    await page.routeWebSocket("**/*", (socket) => {
      connected.resolve(new URL(socket.url()).pathname);
      socket.send('{"value":"webhook received"}');
    });
    await page.route("**/preview/startChat", async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      body.sessionId =
        mode === "legacy" ? "fixture-owner" : "cm123456789012345678901234";
      if (mode !== "legacy") body.previewWebhookRoom = "owner/fixture/webhooks";
      if (mode === "published") body.resultId = "published-result";
      body.clientSideActions = [
        { type: "listenForWebhook", expectsDedicatedReply: true },
      ];
      delete body.input;
      await route.fulfill({ response, json: body });
    });
    const continuation = page.waitForRequest((request) =>
      request.url().endsWith("/continueChat"),
    );
    await page.goto("/");
    expect(await connected.promise).toBe(
      mode === "published"
        ? "/parties/main/published-result/webhooks"
        : "/parties/main/owner/fixture/webhooks",
    );
    expect((await continuation).url()).toContain(
      mode === "legacy"
        ? "/sessions/fixture-owner/"
        : "/sessions/cm123456789012345678901234/",
    );
    expect((await continuation).postDataJSON().message).toEqual({
      type: "text",
      text: '{"value":"webhook received"}',
    });
    await expect(
      page.frameLocator("iframe").getByText("Continuation OK", { exact: true }),
    ).toBeVisible();
  });

const getPreviewDocumentId = async (page: Page) => {
  const documentId = await page.evaluate(() =>
    window.previewDocumentIds.at(-1),
  );
  if (!documentId) throw new Error("Missing preview document ID");
  return documentId;
};

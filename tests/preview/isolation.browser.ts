import { expect, test } from "@playwright/test";
import type { executeScript } from "../../packages/embeds/js/src/features/blocks/logic/script/executeScript";
import type { executeSetVariable } from "../../packages/embeds/js/src/features/blocks/logic/setVariable/executeSetVariable";

declare global {
  interface Window {
    executeScript: typeof executeScript;
    executeSetVariable: typeof executeSetVariable;
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.frameLocator("iframe").locator("body")).toHaveAttribute(
    "data-executed",
    "http://127.0.0.1:5199",
  );
  await page.evaluate(() =>
    localStorage.setItem("builder-secret", "owner-only-data"),
  );
});

for (const executor of ["executeScript", "executeSetVariable"]) {
  const isUnsafe = false;
  test(`${executor}: legacy opt-out cannot expose the builder session`, async ({
    page,
  }) => {
    expect(
      await page.evaluate(() => fetch("/api/private").then((r) => r.text())),
    ).toBe("owner-only-data");
    const before = await page.evaluate(() =>
      fetch("/counts").then((r) => r.json()),
    );
    const frame = page
      .frames()
      .find((frame) => frame.url().includes("/__preview"));
    if (!frame) throw new Error("Missing preview frame");
    const result = await frame.evaluate(
      async ({ executor, isUnsafe }) => {
        const content = `
          const result = {};
          for (const [key, probe] of Object.entries({
            dom: () => document.title,
            parent: () => parent.document.title,
            storage: () => localStorage.getItem('builder-secret'),
            cookies: () => document.cookie,
            network: () => fetch('/public').then(r => r.text()),
            authenticatedApi: () => fetch('http://localhost:5198/api/private', {credentials:'include'}).then(r => r.text()),
            xhr: () => new Promise((resolve, reject) => { const r = new XMLHttpRequest(); r.open('GET','http://localhost:5198/api/private'); r.withCredentials = true; r.onload = () => resolve(r.responseText); r.onerror = reject; r.send(); }),
          })) {
            try { result[key] = await probe(); } catch { result[key] = 'blocked'; }
          }
          return JSON.stringify(result);
        `;
        const legacyScript = { content, args: [], isUnsafe, isCode: true };
        const response =
          executor === "executeScript"
            ? await window.executeScript(legacyScript, { isPreview: true })
            : await window.executeSetVariable(legacyScript, {
                isPreview: true,
              });
        if (response && "scriptCallbackMessage" in response)
          return response.scriptCallbackMessage;
        if (response && "replyToSend" in response) return response.replyToSend;
      },
      { executor, isUnsafe },
    );
    expect(typeof result).toBe("string");
    if (!result) throw new Error("Missing result");
    expect(JSON.parse(result)).toEqual({
      dom: "Preview fixture",
      parent: "blocked",
      storage: null,
      cookies: "",
      network: "network-ok",
      authenticatedApi: "blocked",
      xhr: "blocked",
    });
    expect(
      await page.evaluate(() => fetch("/counts").then((r) => r.json())),
    ).toEqual(before);
    expect(await page.title()).toBe("Preview fixture");
  });
}

test("continues on the viewer, reports input and logs, restarts with a new session", async ({
  page,
}) => {
  const frame = page.frameLocator("iframe");
  await expect(page.locator("body")).toHaveAttribute("data-input", "answer");
  const before = await page.evaluate(() =>
    fetch("/counts").then((r) => r.json()),
  );
  await frame.getByPlaceholder("Your answer").fill("hello");
  const continuation = page.waitForRequest((request) =>
    request.url().includes("/continueChat"),
  );
  await frame.getByRole("button", { name: "Send", exact: true }).click();
  expect((await continuation).url()).toMatch(
    /^http:\/\/127\.0\.0\.1:5199\/api\/v1\/sessions\//,
  );
  await expect(
    frame.getByText("Continuation OK", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("body")).toHaveAttribute(
    "data-logs",
    /Conversation continued/,
  );
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await expect(frame.getByPlaceholder("Your answer")).toBeVisible();
  expect(
    (await page.evaluate(() => fetch("/counts").then((r) => r.json()))).starts,
  ).toBe(before.starts + 1);
});

test("updates theme without restarting or executing scripts in the host", async ({
  page,
}) => {
  const before = await page.evaluate(() =>
    fetch("/counts").then((r) => r.json()),
  );
  await page.getByRole("button", { name: "Change theme" }).click();
  await expect
    .poll(() =>
      page
        .frameLocator("iframe")
        .locator(".typebot-container")
        .evaluate((element) =>
          getComputedStyle(element).getPropertyValue(
            "--typebot-container-bg-color",
          ),
        ),
    )
    .toBe("#112233");
  await expect(page.frameLocator("iframe").locator("body")).toHaveAttribute(
    "data-executions",
    "1",
  );
  expect(await page.locator("body").getAttribute("data-executed")).toBeNull();
  expect(
    await page.evaluate(() => fetch("/counts").then((r) => r.json())),
  ).toEqual(before);
});

test("ignores forged sources, invalid messages and arbitrary request instructions", async ({
  page,
}) => {
  const before = await page.evaluate(() =>
    fetch("/counts").then((r) => r.json()),
  );
  await page.evaluate(() => {
    window.postMessage(
      {
        type: "typebot-preview:input",
        documentId: "00000000-0000-4000-8000-000000000001",
        blockId: "forged",
      },
      "*",
    );
    window.postMessage(
      {
        type: "typebot-preview:ready",
        documentId: "00000000-0000-4000-8000-000000000001",
      },
      "*",
    );
    const sibling = document.createElement("iframe");
    const preview = document.querySelector("iframe");
    if (!preview) throw new Error("Missing preview frame");
    sibling.src = preview.src;
    sibling.id = "sibling";
    document.body.append(sibling);
  });
  await expect(page.locator("#sibling")).toBeAttached();
  await expect(page.frameLocator("#sibling").locator("body")).toBeEmpty();
  const sibling = page.frames().at(-1);
  if (!sibling) throw new Error("Missing sibling");
  await sibling.evaluate(() =>
    parent.postMessage(
      {
        type: "typebot-preview:input",
        documentId: "00000000-0000-4000-8000-000000000001",
        blockId: "forged",
      },
      "*",
    ),
  );
  const frame = page
    .frames()
    .find((frame) => frame.url().includes("/__preview"));
  if (!frame) throw new Error("Missing preview frame");
  await frame.evaluate(() => {
    parent.postMessage(
      {
        type: "typebot-preview:input",
        documentId: "00000000-0000-4000-8000-000000000001",
        blockId: { invalid: true },
      },
      "*",
    );
    parent.postMessage({ type: "fetch", url: "/api/private" }, "*");
    // Same-origin sibling bootstrap is not the parent's selected contentWindow.
    window.postMessage(
      {
        type: "typebot-preview:init",
        documentId: "00000000-0000-4000-8000-000000000001",
        initialChatReply: {},
      },
      "*",
    );
  });
  await expect(page.locator("body")).toHaveAttribute("data-input", "answer");
  expect(
    await page.evaluate(() => fetch("/counts").then((r) => r.json())),
  ).toEqual(before);
});

test("fails closed when builder and viewer share a hostname", async ({
  page,
}) => {
  const before = await page.evaluate(() =>
    fetch("/counts").then((r) => r.json()),
  );
  await page.goto("/?sameHost");
  await expect(page.getByRole("alert")).toContainText("different hostname");
  expect(
    await page.evaluate(() => fetch("/counts").then((r) => r.json())),
  ).toEqual(before);
});

test("fails closed when the viewer cannot load", async ({ page }) => {
  await page.route("http://127.0.0.1:5199/__preview", (route) => route.abort());
  const before = await page.evaluate(() =>
    fetch("/counts").then((r) => r.json()),
  );
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("could not connect", {
    timeout: 25000,
  });
  expect(
    await page.evaluate(() => fetch("/counts").then((r) => r.json())),
  ).toEqual(before);
});

test("preserves DOM expressions, leading zeros, arguments and error logs", async ({
  page,
}) => {
  const frame = page
    .frames()
    .find((frame) => frame.url().includes("/__preview"));
  if (!frame) throw new Error("Missing preview frame");
  expect(
    await frame.evaluate(async () => ({
      expression: await window.executeSetVariable(
        { content: "value + 2", args: [{ id: "value", value: 40 }] },
        { isPreview: true },
      ),
      zeros: await window.executeSetVariable(
        { content: "00123", args: [] },
        { isPreview: true },
      ),
      dom: await window.executeSetVariable(
        { content: "window.innerWidth > 0", args: [] },
        { isPreview: true },
      ),
      script: await window.executeScript(
        {
          content: "<script>return await Promise.resolve(value)</script>",
          args: [{ id: "value", value: "ok" }],
        },
        { isPreview: true },
      ),
      error: await window.executeScript(
        { content: 'throw new Error("expected failure")', args: [] },
        { isPreview: true },
      ),
    })),
  ).toMatchObject({
    expression: { replyToSend: "42" },
    zeros: { replyToSend: "00123" },
    dom: { replyToSend: "true" },
    script: { scriptCallbackMessage: "ok" },
    error: { logs: [{ description: "expected failure" }] },
  });
});

test("restarts with progress tracking when it is enabled", async ({ page }) => {
  const start = page.waitForRequest((request) =>
    request.url().endsWith("/preview/startChat"),
  );
  await page.getByRole("button", { name: "Enable progress" }).click();
  expect((await start).postDataJSON()).toMatchObject({
    isProgressBarEnabled: true,
  });
  await expect(
    page.frameLocator("iframe").getByPlaceholder("Your answer"),
  ).toBeVisible();
});

test("blocks workers in the preview document and top-level navigation", async ({
  page,
}) => {
  const frame = page
    .frames()
    .find((frame) => frame.url().includes("/__preview"));
  if (!frame) throw new Error("Missing preview frame");
  expect(
    await frame.evaluate(async () => {
      const result = { navigation: false, worker: false };
      try {
        if (top) top.location.href = "http://127.0.0.1:5199/public";
      } catch {
        result.navigation = true;
      }
      result.worker = await new Promise<boolean>((resolve) => {
        const url = URL.createObjectURL(
          new Blob(["postMessage('running')"], { type: "text/javascript" }),
        );
        try {
          const worker = new Worker(url);
          worker.onmessage = () => {
            worker.terminate();
            URL.revokeObjectURL(url);
            resolve(false);
          };
          worker.onerror = () => {
            worker.terminate();
            URL.revokeObjectURL(url);
            resolve(true);
          };
        } catch {
          URL.revokeObjectURL(url);
          resolve(true);
        }
      });
      return result;
    }),
  ).toEqual({ navigation: true, worker: true });
  expect(page.url()).toBe("http://localhost:5198/");
});

for (const builderOrigin of [undefined, "http://wrong-builder.example"]) {
  test(`fails closed with runtime builder origin ${builderOrigin}`, async ({
    page,
  }) => {
    const before = await page.evaluate(() =>
      fetch("/counts").then((response) => response.json()),
    );
    await page.route("http://127.0.0.1:5199/__ENV.js", (route) =>
      route.fulfill({
        contentType: "text/javascript",
        body: `window.__ENV = ${JSON.stringify({ NEXT_PUBLIC_BUILDER_ORIGIN: builderOrigin })};`,
      }),
    );
    await page.reload();
    await expect(page.frameLocator("iframe").locator("body")).toBeEmpty();
    expect(
      await page.evaluate(() =>
        fetch("/counts").then((response) => response.json()),
      ),
    ).toEqual(before);
    expect(await page.locator("body").getAttribute("data-executed")).toBeNull();
  });
}

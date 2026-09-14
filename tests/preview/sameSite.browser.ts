import { expect, test } from "@playwright/test";

const builderOrigin = "https://builder.typebot.test:5200";
const viewerOrigin = "https://viewer.typebot.test:5201";

test.beforeEach(async ({ page }) => {
  await page.goto(builderOrigin);
  await expect(page.frameLocator("iframe").locator("body")).toHaveAttribute(
    "data-executed",
    viewerOrigin,
  );
});

for (const executor of ["executeScript", "executeSetVariable"])
  test(`${executor}: same-site previews cannot mutate with the owner's cookie`, async ({
    page,
  }) => {
    const probe = crypto.randomUUID();
    const frame = page
      .frames()
      .find((frame) => frame.url().includes("/__preview"));
    if (!frame) throw new Error("Missing preview frame");
    await frame.evaluate(
      async ({ executor, builderOrigin, probe }) => {
        const content = `
        const url = ${JSON.stringify(`${builderOrigin}/api/v1/typebots/fixture/unpublish?probe=${probe}`)};
        await fetch(url, { method: 'POST', credentials: 'include', mode: 'no-cors', body: 'fetch' });
        await new Promise(resolve => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', url);
          xhr.withCredentials = true;
          xhr.onloadend = resolve;
          xhr.send('xhr');
        });
        navigator.sendBeacon(url, 'beacon');
        const target = document.createElement('iframe');
        target.name = 'form-target';
        document.body.append(target);
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        form.target = target.name;
        document.body.append(form);
        form.submit();
        const image = document.createElement('img');
        image.src = url;
        document.body.append(image);
        await fetch('/redirect-to-builder?probe=${probe}', { credentials: 'include', mode: 'no-cors' });
        return 'attempts-sent';
      `;
        const script = { content, args: [], isCode: true, isUnsafe: false };
        if (executor === "executeScript")
          await window.executeScript(script, { isPreview: true });
        else await window.executeSetVariable(script, { isPreview: true });
      },
      { executor, builderOrigin, probe },
    );

    await expect
      .poll(() =>
        page.evaluate(async (probe) => {
          const attempts: {
            probe: string;
            site: string;
            sentCookie: boolean;
            authenticated: boolean;
          }[] = await fetch("/attempts").then((response) => response.json());
          return attempts.filter((attempt) => attempt.probe === probe);
        }, probe),
      )
      .toEqual(
        Array.from({ length: 6 }, () => ({
          probe,
          site: "same-site",
          sentCookie: true,
          authenticated: false,
        })),
      );

    // The host's session remains usable after all attempted cross-origin writes.
    expect(
      await page.evaluate(() =>
        fetch("/api/v1/typebots/fixture/unpublish", { method: "POST" }).then(
          (response) => response.status,
        ),
      ),
    ).toBe(200);
    expect(
      await frame.evaluate(() =>
        fetch("/public").then((response) => response.text()),
      ),
    ).toBe("network-ok");
  });

test("API clients keep explicit Bearer authentication without origin headers", async ({
  request,
}) => {
  expect(
    (
      await request.post(
        "https://127.0.0.1:5200/api/v1/typebots/fixture/unpublish",
        {
          headers: { Authorization: "Bearer fixture-token" },
        },
      )
    ).status(),
  ).toBe(200);
});

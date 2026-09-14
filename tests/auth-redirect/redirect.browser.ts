import { expect, test } from "@playwright/test";

const externalPaths = [
  "https://example.org/",
  "//example.org/",
  "/\\example.org/",
  "/\t/example.org/",
  "/a/..//example.org/",
  "/%2e%2e//example.org/",
  "%2f%2fexample.org/",
  "javascript:alert(1)",
];
const internalPaths = [
  "/feedback/123?filter=a%20b&filter=c#reply",
  "/fr/typebots?folder=abc#section",
  "/%2f%2fexample.org",
  "/%5cexample.org",
  "/%252f%252fexample.org",
];
for (const authenticated of [false, true]) {
  for (const destination of [...externalPaths, ...internalPaths]) {
    test(`${authenticated ? "existing session" : "after login"}: ${JSON.stringify(destination)}`, async ({
      page,
    }) => {
      const externalRequests: string[] = [];
      await page.route("https://example.org/**", (route) => {
        externalRequests.push(route.request().url());
        return route.fulfill({ body: "Benign external destination" });
      });
      if (authenticated) {
        await page.goto("/typebots");
        await page
          .getByRole("button", { name: "Sign in synthetic user" })
          .click();
        await expect(
          page.getByText("Session: authenticated", { exact: true }),
        ).toBeVisible();
      }
      await page.goto(
        `/signin?${new URLSearchParams({ redirectPath: destination })}`,
      );
      if (!authenticated) {
        await expect(
          page.getByText("Session: unauthenticated", { exact: true }),
        ).toBeVisible();
        await page
          .getByRole("button", { name: "Sign in synthetic user" })
          .click();
      }
      const expected = internalPaths.includes(destination)
        ? destination
        : "/typebots";
      await expect(page).toHaveURL(`http://localhost:5298${expected}`);
      await expect(
        page.getByText("Session: authenticated", { exact: true }),
      ).toBeVisible();
      expect(externalRequests).toEqual([]);
    });
  }
}

test("proxy preserves query/hash in direct and nested OAuth return paths", async ({
  page,
  request,
}) => {
  const destination = "/feedback/123?filter=a%20b&filter=c#reply";
  for (const params of [
    new URLSearchParams({ redirectPath: destination, discarded: "old" }),
    new URLSearchParams({
      callbackUrl: `http://localhost:5298/typebots?${new URLSearchParams({ redirectPath: destination })}`,
    }),
    new URLSearchParams({
      callbackUrl: `/typebots?${new URLSearchParams({ redirectPath: destination })}`,
    }),
  ]) {
    const response = await request.get(`/typebots?${params}`, {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(307);
    expect(
      new URL(response.headers().location, "http://localhost:5298").href,
    ).toBe(`http://localhost:5298${destination}`);
    await page.goto(`/typebots?${params}`);
    await expect(page).toHaveURL(`http://localhost:5298${destination}`);
  }
  const malformed = await request.get("/typebots?callbackUrl=http://[", {
    maxRedirects: 0,
  });
  expect(malformed.status()).toBe(200);
  for (const redirectPath of externalPaths) {
    const response = await request.get(
      `/typebots?${new URLSearchParams({ redirectPath })}`,
      { maxRedirects: 0 },
    );
    expect(response.status()).toBe(200);
    expect(response.headers().location).toBeUndefined();
  }
});

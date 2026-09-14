import { expect, it } from "bun:test";
import { createEmailMagicLink } from "@typebot.io/auth/helpers/createEmailMagicLink";
import { sanitizeRedirectPath } from "@typebot.io/auth/helpers/sanitizeRedirectPath";

const rejected = [
  undefined,
  null,
  "",
  "https://example.org",
  "http://example.org",
  "//example.org",
  "///example.org",
  "//user@example.org",
  "https://redirect.invalid/typebots",
  "javascript:alert(1)",
  "java\nscript:alert(1)",
  "data:text/html,test",
  "&#106;avascript:alert(1)",
  "typebots",
  "@example.org",
  "?query=value",
  "#hash",
  "/\\example.org",
  "\\\\example.org",
  "/\t/example.org",
  "/\n/example.org",
  " //example.org",
  "/path\u0000",
  "/a/..//example.org",
  "/%2e%2e//example.org",
  "%2F%2Fexample.org",
  "%252F%252Fexample.org",
  "https%3A%2F%2Fexample.org",
];

for (const value of rejected)
  it(`rejects ${JSON.stringify(value)}`, () => {
    expect(sanitizeRedirectPath(value)).toBeNull();
  });

for (const value of [
  "/",
  "/typebots",
  "/fr/typebots?folder=abc#section",
  "/feedback/123?x=1&x=2#reply",
  "/path%20with%20spaces?next=https%3A%2F%2Fexample.org#hash",
  "/user@example.org",
  "/typebots?next=//example.org#https://example.org",
  "/%2f%2fexample.org",
  "/%5cexample.org",
  "/%252f%252fexample.org",
])
  it(`preserves internal path ${value} without decoding it again`, () => {
    expect(sanitizeRedirectPath(value)).toBe(value);
    expect(new URL(value, "https://builder.example").origin).toBe(
      "https://builder.example",
    );
  });

it("normalizes safe dot segments and applies policy after query decoding", () => {
  expect(sanitizeRedirectPath("/folder/../typebots?x=1#h")).toBe(
    "/typebots?x=1#h",
  );
  expect(
    sanitizeRedirectPath("/path with spaces?filter=hello world#reply now"),
  ).toBe("/path%20with%20spaces?filter=hello%20world#reply%20now");
  for (const encoded of [
    "%2f%2fexample.org",
    "%2f%5cexample.org",
    "https%3a%2f%2fexample.org",
  ])
    expect(
      sanitizeRedirectPath(
        new URLSearchParams(`redirectPath=${encoded}`).get("redirectPath"),
      ),
    ).toBeNull();
});

it("keeps magic-link callbacks internal, including authority/userinfo inputs", () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { origin: "http://localhost:5298" } },
  });
  try {
    for (const value of rejected) {
      const url = new URL(
        createEmailMagicLink(
          "123456",
          " Synthetic@Example.test ",
          value ?? undefined,
        ),
      );
      expect(url.pathname).toBe("/api/auth/callback/nodemailer");
      expect(url.searchParams.get("callbackUrl")).toBe(
        "http://localhost:5298/typebots",
      );
      expect(url.searchParams.get("email")).toBe("synthetic@example.test");
    }
    expect(
      new URL(
        createEmailMagicLink(
          "123456",
          "synthetic@example.test",
          "/feedback/123?x=1#reply",
        ),
      ).searchParams.get("callbackUrl"),
    ).toBe("http://localhost:5298/feedback/123?x=1#reply");
  } finally {
    if (previousWindow)
      Object.defineProperty(globalThis, "window", previousWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
});

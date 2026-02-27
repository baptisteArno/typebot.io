import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { $ } from "bun";

const authStatePath = "apps/viewer/src/test/.auth/user.json";
const targetUrl = "http://localhost:3000";

const authStateContent = await readFile(resolve(authStatePath), "utf8");
const authState = JSON.parse(authStateContent) as {
  cookies?: { name?: string; value?: string }[];
};

const sessionCookie = authState.cookies?.find(
  (cookie) => cookie.name === "authjs.session-token",
);
const csrfCookie = authState.cookies?.find(
  (cookie) => cookie.name === "authjs.csrf-token",
);

if (!sessionCookie?.value || !csrfCookie?.value) {
  throw new Error(
    `Missing auth cookies in ${authStatePath}. Expected authjs.session-token and authjs.csrf-token.`,
  );
}

const origin = new URL(targetUrl).origin;
await $`agent-browser open ${origin}/signin`;
await $`agent-browser cookies set authjs.session-token ${sessionCookie.value}`;
await $`agent-browser cookies set authjs.csrf-token ${csrfCookie.value}`;

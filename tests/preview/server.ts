import { AsyncLocalStorage } from "node:async_hooks";
import { mkdir } from "node:fs/promises";

const sameSiteBuilderOrigin = "https://builder.typebot.test:5200";
process.env.SKIP_ENV_CHECK = "true";
process.env.NEXTAUTH_URL = sameSiteBuilderOrigin;
Object.assign(globalThis, { AsyncLocalStorage });
const { NextRequest } = await import("next/server");
const { unstable_doesMiddlewareMatch } = await import(
  "next/experimental/testing/server"
);
const { proxy, config } = await import("../../apps/builder/src/proxy");

// Disposable certificate, used only by the loopback HTTPS fixture.
const certificateDirectory = "test-results/preview-isolation-tls";
await mkdir(certificateDirectory, { recursive: true });
const certificate = Bun.spawnSync([
  "openssl",
  "req",
  "-x509",
  "-newkey",
  "rsa:2048",
  "-nodes",
  "-days",
  "1",
  "-subj",
  "/CN=*.typebot.test",
  "-keyout",
  `${certificateDirectory}/key.pem`,
  "-out",
  `${certificateDirectory}/cert.pem`,
]);
if (certificate.exitCode !== 0) throw new Error(certificate.stderr.toString());

const bundle = await Bun.build({
  entrypoints: [new URL("./entry.tsx", import.meta.url).pathname],
  target: "browser",
  plugins: [
    {
      name: "fixture-config-and-button",
      setup(build) {
        build.onResolve({ filter: /^@typebot.io\/env$/ }, () => ({
          path: "env",
          namespace: "fixture",
        }));
        build.onResolve(
          { filter: /^@typebot.io\/ui\/components\/Button$/ },
          () => ({ path: "button", namespace: "fixture" }),
        );
        build.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => ({
          contents:
            path === "env"
              ? 'export const env = { NEXT_PUBLIC_BUILDER_ORIGIN: window.__ENV?.NEXT_PUBLIC_BUILDER_ORIGIN, NEXT_PUBLIC_VIEWER_URL: [new URLSearchParams(location.search).has("sameHost") ? "http://localhost:5199" : window.__ENV?.NEXT_PUBLIC_VIEWER_URL ?? "http://127.0.0.1:5199"] };'
              : 'import {createElement} from "react"; export const Button = props => createElement("button", props);',
          loader: "js",
          resolveDir: import.meta.dir,
        }));
      },
    },
  ],
});
if (!bundle.success) throw new AggregateError(bundle.logs);

let authenticatedRequests = 0;
let starts = 0;
const sameSiteAttempts: {
  probe: string | null;
  site: string | null;
  sentCookie: boolean;
  authenticated: boolean;
}[] = [];
for (const port of [5198, 5199, 5200, 5201])
  Bun.serve({
    hostname: "127.0.0.1",
    port,
    ...(port >= 5200
      ? {
          tls: {
            key: Bun.file(`${certificateDirectory}/key.pem`),
            cert: Bun.file(`${certificateDirectory}/cert.pem`),
          },
        }
      : {}),
    async fetch(request) {
      const url = new URL(request.url);
      const isBuilder = port === 5198 || port === 5200;
      const builderOrigin =
        port >= 5200 ? sameSiteBuilderOrigin : "http://localhost:5198";
      if (url.pathname === "/proxy-response") {
        const { path, method, headers } = await request.json();
        if (!unstable_doesMiddlewareMatch({ config, url: path }))
          return new Response("Proxy did not match", { status: 404 });
        return proxy(
          new NextRequest(`${sameSiteBuilderOrigin}${path}`, {
            method,
            headers,
          }),
        );
      }
      if (url.pathname === "/__ENV.js")
        return new Response(
          `window.__ENV = ${JSON.stringify({ NEXT_PUBLIC_BUILDER_ORIGIN: builderOrigin, NEXT_PUBLIC_VIEWER_URL: port >= 5200 ? "https://viewer.typebot.test:5201" : "http://127.0.0.1:5199" })};`,
          { headers: { "Content-Type": "text/javascript" } },
        );
      if (url.pathname === "/entry.js")
        return new Response(bundle.outputs[0], {
          headers: { "Content-Type": "text/javascript" },
        });
      if (url.pathname === "/api/private") {
        if (
          !request.headers.get("cookie")?.includes("authjs.session-token=owner")
        )
          return new Response("Unauthorized", { status: 401 });
        authenticatedRequests++;
        return new Response("owner-only-data");
      }
      if (url.pathname === "/counts")
        return Response.json({ authenticatedRequests, starts });
      if (url.pathname === "/attempts") return Response.json(sameSiteAttempts);
      if (url.pathname === "/redirect-to-builder")
        return Response.redirect(
          `${builderOrigin}/api/v1/typebots/fixture/unpublish${url.search}`,
        );
      if (
        port === 5200 &&
        url.pathname === "/api/v1/typebots/fixture/unpublish"
      ) {
        // Run the actual Next proxy, then inspect the headers it forwards to auth.
        const response = proxy(
          new NextRequest(request.url, {
            method: request.method,
            headers: request.headers,
          }),
        );
        const forwardedHeaders = response.headers.get(
          "x-middleware-override-headers",
        );
        const cookie =
          forwardedHeaders === null
            ? request.headers.get("cookie")
            : response.headers.get("x-middleware-request-cookie");
        const authenticated =
          Boolean(cookie?.includes("authjs.session-token=owner")) ||
          request.headers.get("authorization") === "Bearer fixture-token";
        sameSiteAttempts.push({
          probe: url.searchParams.get("probe"),
          site: request.headers.get("sec-fetch-site"),
          sentCookie: Boolean(
            request.headers
              .get("cookie")
              ?.includes("authjs.session-token=owner"),
          ),
          authenticated,
        });
        return new Response(authenticated ? "unpublished" : "Unauthorized", {
          status: authenticated ? 200 : 401,
        });
      }
      if (url.pathname === "/public") return new Response("network-ok");
      if (url.pathname.endsWith("/preview/startChat")) {
        if (
          !isBuilder ||
          !request.headers.get("cookie")?.includes("authjs.session-token=owner")
        )
          return new Response(null, { status: 401 });
        starts++;
        return Response.json({
          sessionId: crypto.randomUUID(),
          progress: 0,
          typebot: { id: "fixture", version: "6.1", theme: {}, settings: {} },
          messages: [],
          input: {
            id: "answer",
            type: "text input",
            options: { labels: { placeholder: "Your answer", button: "Send" } },
          },
          clientSideActions: [
            {
              type: "scriptToExecute",
              scriptToExecute: {
                content:
                  "document.body.dataset.executed = location.origin; document.body.dataset.executions = String(Number(document.body.dataset.executions ?? 0) + 1);",
                args: [],
                isUnsafe: false,
              },
            },
          ],
        });
      }
      if (url.pathname.endsWith("/continueChat"))
        return Response.json({
          messages: [
            {
              id: "done",
              type: "text",
              content: {
                type: "richText",
                richText: [
                  { type: "p", children: [{ text: "Continuation OK" }] },
                ],
              },
            },
          ],
          logs: [{ status: "info", description: "Conversation continued" }],
        });
      return new Response(
        '<!doctype html><title>Preview fixture</title><body><script src="/__ENV.js"></script><script type="module" src="/entry.js"></script>',
        {
          headers: {
            "Content-Type": "text/html",
            ...(isBuilder
              ? {
                  "Set-Cookie": `authjs.session-token=owner; HttpOnly; SameSite=Lax; Path=/${port >= 5200 ? "; Secure" : ""}`,
                }
              : {
                  "Content-Security-Policy": `frame-ancestors ${builderOrigin}; worker-src 'none'; object-src 'none'; base-uri 'none'`,
                  "Referrer-Policy": "no-referrer",
                }),
          },
        },
      );
    },
  });

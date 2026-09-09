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
              ? 'export const env = { NEXT_PUBLIC_BUILDER_ORIGIN: window.__ENV?.NEXT_PUBLIC_BUILDER_ORIGIN, NEXT_PUBLIC_VIEWER_URL: [new URLSearchParams(location.search).has("sameHost") ? "http://localhost:5199" : "http://127.0.0.1:5199"] };'
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
for (const port of [5198, 5199])
  Bun.serve({
    hostname: "127.0.0.1",
    port,
    async fetch(request) {
      const url = new URL(request.url);
      if (url.pathname === "/__ENV.js")
        return new Response(
          'window.__ENV = { NEXT_PUBLIC_BUILDER_ORIGIN: "http://localhost:5198" };',
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
      if (url.pathname === "/public") return new Response("network-ok");
      if (url.pathname.endsWith("/preview/startChat")) {
        if (
          port !== 5198 ||
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
            ...(port === 5198
              ? {
                  "Set-Cookie":
                    "authjs.session-token=owner; HttpOnly; SameSite=Lax; Path=/",
                }
              : {
                  "Content-Security-Policy":
                    "frame-ancestors http://localhost:5198; worker-src 'none'; object-src 'none'; base-uri 'none'",
                }),
          },
        },
      );
    },
  });

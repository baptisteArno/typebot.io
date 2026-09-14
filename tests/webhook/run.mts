import { execFileSync, spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { setTimeout } from "node:timers/promises";

// Nx may load .env. Never let the fixture inherit service credentials or URLs.
for (const name of Object.keys(process.env)) {
  if (!["PATH", "HOME", "TMPDIR", "TMP", "TEMP", "DOCKER_HOST"].includes(name))
    delete process.env[name];
}
const relaySecret = "synthetic-local-webhook-relay-key-0001";
const container = execFileSync(
  "docker",
  [
    "run",
    "--rm",
    "-d",
    "-e",
    "POSTGRES_PASSWORD=fixture",
    "-p",
    "127.0.0.1::5432",
    "postgres:alpine",
  ],
  { encoding: "utf8" },
).trim();
const port = execFileSync(
  "docker",
  [
    "inspect",
    "--format",
    '{{(index (index .NetworkSettings.Ports "5432/tcp") 0).HostPort}}',
    container,
  ],
  { encoding: "utf8" },
).trim();
const databaseUrl = `postgresql://postgres:fixture@127.0.0.1:${port}/postgres`;
Object.assign(process.env, {
  DATABASE_URL: databaseUrl,
  ENCRYPTION_SECRET: "00000000000000000000000000000000",
  NEXTAUTH_URL: "http://localhost:5290",
  NEXT_PUBLIC_VIEWER_URL: "http://127.0.0.1:5290",
  NEXT_PUBLIC_PARTYKIT_HOST: "localhost:5292",
  WEBHOOK_RELAY_SECRET: relaySecret,
  NODE_ENV: "test",
  DEFAULT_WORKSPACE_PLAN: "UNLIMITED",
  META_SYSTEM_USER_TOKEN: "fixture-meta-token",
  WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID: "fixture-phone",
  SMTP_FROM: "qa@example.test",
  DISABLE_TELEMETRY: "true",
});
const originalFetch = globalThis.fetch;
let providerRequests = 0;
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : input);
  if (
    url.hostname === "graph.facebook.com" &&
    url.pathname.endsWith("/fixture-phone/messages")
  ) {
    providerRequests++;
    return new Response(
      JSON.stringify({ messages: [{ id: "fixture-message" }] }),
      { headers: { "Content-Type": "application/json" } },
    );
  }
  if (!["localhost", "127.0.0.1"].includes(url.hostname))
    throw new Error("External network blocked in webhook fixture");
  return originalFetch(input, init);
};
const relay = spawn(
  process.execPath,
  [
    "node_modules/partykit/dist/bin.mjs",
    "dev",
    "--config",
    "packages/partykit/partykit.json",
    "--port",
    "5292",
    "--var",
    `WEBHOOK_RELAY_SECRET=${relaySecret}`,
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);
let relayOutput = "";
relay.stdout?.on("data", (data) => {
  relayOutput += data.toString();
});
relay.stderr?.on("data", (data) => {
  relayOutput += data.toString();
});
const cleanup = () => {
  relay.kill();
  try {
    execFileSync("docker", ["stop", container], { stdio: "ignore" });
  } catch {}
};
process.on("SIGTERM", () => {
  cleanup();
  process.exit(0);
});
process.on("SIGINT", () => {
  cleanup();
  process.exit(0);
});
try {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      execFileSync(
        "docker",
        ["exec", container, "pg_isready", "-U", "postgres"],
        { stdio: "ignore" },
      );
      break;
    } catch {
      await setTimeout(500);
    }
  }
  const { runDatabaseSetup } = await import(
    "../../packages/config/src/tests/runDatabaseSetup.ts"
  );
  await runDatabaseSetup(databaseUrl);
  const { default: prisma } = await import(
    "../../packages/prisma/src/index.ts"
  );
  const { OpenAPIHandler } = await import("@orpc/openapi/fetch");
  const { chatRouter, builderChatRouter } = await import(
    "../../packages/bot-engine/src/api/router.ts"
  );
  const { webhookRouter } = await import(
    "../../packages/blocks/webhook/src/api/router.ts"
  );
  const { getWebhookSubscription } = await import(
    "../../apps/builder/src/features/blocks/logic/webhook/api/getWebhookSubscription.ts"
  );
  const { call } = await import("@orpc/server");
  const { userId } = await import(
    "../../packages/config/src/tests/seedDatabaseForTest.ts"
  );
  const owner = {
    id: userId,
    email: "test@typebot.io",
    groupTitlesAutoGeneration: null,
  };
  const block = {
    id: "webhook",
    type: "webhook",
    options: {
      responseVariableMapping: [
        { id: "mapping", variableId: "answer", bodyPath: "data.answer" },
      ],
    },
  };
  const groups = [
    {
      id: "group1",
      title: "Webhook",
      graphCoordinates: { x: 0, y: 0 },
      blocks: [
        block,
        {
          id: "receipt",
          type: "text",
          content: {
            richText: [{ type: "p", children: [{ text: "Webhook accepted" }] }],
          },
        },
        { id: "next", type: "text input", outgoingEdgeId: "repeat" },
      ],
    },
  ];
  const flow = {
    groups,
    edges: [
      { id: "edge1", from: { eventId: "event1" }, to: { groupId: "group1" } },
      { id: "repeat", from: { blockId: "next" }, to: { groupId: "group1" } },
    ],
    variables: [{ id: "answer", name: "answer" }],
  };
  await prisma.typebot.update({ where: { id: "proTypebot" }, data: flow });
  await prisma.publicTypebot.update({
    where: { id: "proTypebot-public" },
    data: flow,
  });
  const handler = new OpenAPIHandler({
    ...chatRouter,
    ...webhookRouter,
    startChatPreview: builderChatRouter.startChatPreviewProcedure,
  });
  const server = createServer(async (incoming, outgoing) => {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of incoming) chunks.push(Buffer.from(chunk));
      const request = new Request(`http://localhost:5290${incoming.url}`, {
        method: incoming.method,
        headers: Object.fromEntries(
          Object.entries(incoming.headers).flatMap(([key, value]) =>
            value === undefined
              ? []
              : [[key, Array.isArray(value) ? value.join(",") : value]],
          ),
        ),
        ...(chunks.length ? { body: Buffer.concat(chunks) } : {}),
      });
      if (incoming.url === "/") {
        outgoing.setHeader("Content-Type", "text/html; charset=utf-8");
        outgoing.end(readFileSync(new URL("./index.html", import.meta.url)));
        return;
      }
      if (incoming.url === "/client-fixture") {
        outgoing.setHeader("Content-Type", "application/json");
        outgoing.end(JSON.stringify({ answer: "client-contract" }));
        return;
      }
      if (incoming.url === "/report") {
        outgoing.setHeader("Content-Type", "application/json");
        outgoing.end(JSON.stringify(report, null, 2));
        return;
      }
      if (incoming.url === "/subscription") {
        const result = await call(
          getWebhookSubscription,
          { typebotId: "proTypebot", blockId: "webhook" },
          {
            context: {
              authenticate: async () =>
                request.headers.get("authorization") === "Bearer fixture-owner"
                  ? owner
                  : null,
              apiOrigin: "http://localhost:5290",
            },
          },
        );
        outgoing.setHeader("Content-Type", "application/json");
        outgoing.end(JSON.stringify(result));
        return;
      }
      const { response } = await handler.handle(request, {
        prefix: "/api",
        context: {
          apiOrigin: "http://localhost:5290",
          origin: undefined,
          iframeReferrerOrigin: undefined,
          authenticate: async () =>
            request.headers.get("authorization") === "Bearer fixture-owner"
              ? owner
              : null,
        },
      });
      outgoing.writeHead(
        response?.status ?? 404,
        response ? Object.fromEntries(response.headers) : {},
      );
      outgoing.end(
        response ? Buffer.from(await response.arrayBuffer()) : "Not found",
      );
    } catch (error) {
      console.error(error);
      outgoing.writeHead(500);
      outgoing.end("Fixture error");
    }
  });
  let report: unknown = { status: "running" };
  await new Promise<void>((resolve) =>
    server.listen(5290, "127.0.0.1", resolve),
  );
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      await fetch("http://localhost:5292/parties/main/health", {
        method: "POST",
        body: "invalid",
      });
      break;
    } catch {
      if (attempt === 59) throw new Error(relayOutput);
      await setTimeout(500);
    }
  }
  const { replay } = await import("./replay.mts");
  report = {
    ...(await replay(prisma)),
    simulatedProviderRequests: providerRequests,
  };
  console.log(JSON.stringify(report, null, 2));
  if (process.argv.includes("--serve"))
    console.log("Preview: http://localhost:5290");
  else {
    server.close();
    await prisma.$disconnect();
    cleanup();
  }
} catch (error) {
  cleanup();
  throw error;
}

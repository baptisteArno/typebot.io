import assert from "node:assert/strict";
import { setTimeout } from "node:timers/promises";
import type { PrismaClient } from "@prisma/client";
import { clientSideActionSchema } from "../../packages/chat-api/src/clientSideAction.ts";
import {
  startChatResponseSchema,
  startPreviewChatResponseSchema,
} from "../../packages/chat-api/src/schemas.ts";
import { sessionStateSchema } from "../../packages/chat-session/src/schemas.ts";
import { listenForWebhook } from "../../packages/embeds/js/src/features/blocks/logic/webhook/listenForWebhook.ts";
import { signWebhookToken } from "../../packages/lib/src/signWebhookToken.ts";
import { verifyWebhookToken } from "../../packages/lib/src/verifyWebhookToken.ts";

const origin = "http://localhost:5290";
const secret = "synthetic-local-webhook-relay-key-0001";
const post = (path: string, body: unknown, authorized = false) =>
  fetch(origin + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authorized ? { Authorization: "Bearer fixture-owner" } : {}),
    },
    body: JSON.stringify(body),
  });
const continueChat = (sessionId: string, message: unknown) =>
  post(`/api/v1/sessions/${sessionId}/continueChat`, { message });
const start = async (preview = false, resultId?: string) => {
  const response = await post(
    preview
      ? "/api/v1/typebots/proTypebot/preview/startChat"
      : "/api/v1/typebots/proTypebot-public/startChat",
    { resultId },
    preview,
  );
  assert.equal(response.status, 200, await response.clone().text());
  return preview
    ? startPreviewChatResponseSchema.parse(await response.json())
    : startChatResponseSchema.parse(await response.json());
};
const getAction = (actions: unknown) => {
  assert.ok(Array.isArray(actions));
  const action = clientSideActionSchema.parse(actions[0]);
  assert.equal(action.type, "listenForWebhook");
  if (action.type !== "listenForWebhook")
    throw new Error("Expected webhook action");
  return action;
};
const connects = (room: string, token?: string) =>
  new Promise<boolean>((resolve) => {
    const ws = new WebSocket(
      "ws://localhost:5292/parties/main/" +
        encodeURIComponent(room) +
        (token ? `?token=${encodeURIComponent(token)}` : ""),
    );
    const timer = setTimeout(5000).then(() => {
      ws.close();
      resolve(false);
    });
    void timer;
    ws.addEventListener("open", () => {
      ws.close();
      resolve(true);
    });
    ws.addEventListener("error", () => resolve(false));
  });

export const replay = async (prisma: PrismaClient) => {
  const checks: string[] = [];
  const first = await start();
  const action = getAction(first.clientSideActions);
  const pendingBefore = await prisma.chatSession.findUniqueOrThrow({
    where: { id: first.sessionId },
  });
  for (const forged of [
    { type: "text", text: JSON.stringify({ data: { answer: "forged" } }) },
    { type: "text", text: "forged" },
    null,
    { type: "command", command: "skip" },
    { type: "text", text: action.token },
  ]) {
    assert.equal((await continueChat(first.sessionId, forged)).status, 400);
    const unchanged = await prisma.chatSession.findUniqueOrThrow({
      where: { id: first.sessionId },
    });
    assert.deepEqual(unchanged.state, pendingBefore.state);
  }
  checks.push(
    "Public continueChat rejects JSON/text/empty/command/subscription-token forgeries without changing persisted state",
  );
  assert.equal(await connects(action.room), false);
  assert.equal(await connects(`${action.room}-foreign`, action.token), false);
  assert.equal(await connects(action.room, action.token), true);
  const relayUrl = `http://localhost:5292/parties/main/${encodeURIComponent(action.room)}`;
  assert.equal(
    (
      await fetch(relayUrl, {
        method: "POST",
        body: JSON.stringify({ answer: "forged" }),
      })
    ).status,
    401,
  );
  assert.equal(
    (await fetch(relayUrl, { method: "POST", body: action.token })).status,
    401,
  );
  const publication = await signWebhookToken(
    {
      purpose: "publish",
      room: action.room,
      blockId: "webhook",
      nonce: "publication",
      expiresAt: Date.now() + 60_000,
      payload: JSON.stringify({ data: { answer: "foreign" } }),
    },
    secret,
  );
  assert.equal(
    (await fetch(`${relayUrl}-foreign`, { method: "POST", body: publication }))
      .status,
    401,
  );
  assert.equal(await verifyWebhookToken(action.token, undefined), undefined);
  assert.equal(
    await verifyWebhookToken(
      action.token,
      "different-synthetic-secret-00000000",
    ),
    undefined,
  );
  checks.push(
    "Real PartyKit denies unauthenticated publish/subscribe and foreign-room subscription; own subscription works",
  );
  const webhookPath =
    "/api/v1/typebots/proTypebot/blocks/webhook/results/" +
    ("resultId" in first ? first.resultId : "") +
    "/executeWebhook";
  assert.equal((await post(webhookPath, { answer: "no-auth" })).status, 401);
  assert.equal(
    (await post(webhookPath, { answer: "offline" }, true)).status,
    502,
  );
  const foreign = await start();
  const listener = listenForWebhook({
    room: action.room,
    token: action.token,
    context: {
      sessionId: first.sessionId,
      isPreview: false,
      wsHost: "localhost:5292",
    },
  });
  await setTimeout(300);
  assert.equal(
    (await post(webhookPath, { answer: "légitime" }, true)).status,
    200,
  );
  const delivered = await Promise.race([
    listener,
    setTimeout(5000).then(() => {
      throw new Error("No legitimate relay response");
    }),
  ]);
  assert.ok(delivered.replyToSend);
  const responseToken = delivered.replyToSend;
  const verified = await verifyWebhookToken(responseToken, secret);
  assert.equal(verified?.purpose, "response");
  assert.equal(
    (await continueChat(foreign.sessionId, responseToken)).status,
    400,
  );
  assert.equal(
    (
      await continueChat(
        first.sessionId,
        `${responseToken.slice(0, -8)}tampered`,
      )
    ).status,
    400,
  );
  const concurrent = await Promise.all([
    continueChat(first.sessionId, responseToken),
    continueChat(first.sessionId, responseToken),
  ]);
  assert.deepEqual(
    concurrent.map((response) => response.status).sort(),
    [200, 400],
  );
  const accepted = sessionStateSchema.parse(
    (
      await prisma.chatSession.findUniqueOrThrow({
        where: { id: first.sessionId },
      })
    ).state,
  );
  assert.equal(accepted.currentBlockId, "next");
  assert.equal(accepted.pendingWebhook, undefined);
  assert.equal(
    accepted.typebotsQueue[0].typebot.variables.find(
      (variable) => variable.id === "answer",
    )?.value,
    "légitime",
  );
  checks.push(
    "Authorized endpoint -> real PartyKit -> actual embed listener -> public continueChat maps legitimate Unicode data; cross-session/tampered/concurrent replay rejected",
  );
  const loop = await continueChat(first.sessionId, "again");
  assert.equal(loop.status, 200, await loop.clone().text());
  assert.equal(
    (await continueChat(first.sessionId, responseToken)).status,
    400,
  );
  checks.push(
    "A previous response cannot satisfy a later wait on the same block",
  );

  const nextWaitAction = getAction((await loop.json()).clientSideActions);
  const nextWaitListener = listenForWebhook({
    room: nextWaitAction.room,
    token: nextWaitAction.token,
    context: {
      sessionId: first.sessionId,
      isPreview: false,
      wsHost: "localhost:5292",
    },
  });
  await setTimeout(300);
  const copies = await Promise.all([
    fetch(relayUrl, { method: "POST", body: publication }),
    fetch(relayUrl, { method: "POST", body: publication }),
  ]);
  assert.deepEqual(
    copies.map((response) => response.status).sort(),
    [200, 409],
  );
  const nextWaitReply = await Promise.race([
    nextWaitListener,
    setTimeout(5000).then(() => {
      throw new Error("No single-use publication response");
    }),
  ]);
  assert.equal(
    (await continueChat(first.sessionId, nextWaitReply.replyToSend)).status,
    200,
  );
  assert.equal((await continueChat(first.sessionId, "again")).status, 200);
  const beforePublicationReplay = await prisma.chatSession.findUniqueOrThrow({
    where: { id: first.sessionId },
  });
  assert.equal(
    (await fetch(relayUrl, { method: "POST", body: publication })).status,
    409,
  );
  assert.deepEqual(
    (
      await prisma.chatSession.findUniqueOrThrow({
        where: { id: first.sessionId },
      })
    ).state,
    beforePublicationReplay.state,
  );
  checks.push(
    "Concurrent signed publications are single-use; replay cannot be re-signed for a later wait on the same room and block",
  );

  const remembered = await start();
  assert.ok("resultId" in remembered && remembered.resultId);
  const rememberedAction = getAction(remembered.clientSideActions);
  const oldWait = await prisma.chatSession.findUniqueOrThrow({
    where: { id: remembered.sessionId },
  });
  const oldMessages: string[] = [];
  const oldSocket = new WebSocket(
    `ws://localhost:5292/parties/main/${encodeURIComponent(rememberedAction.room)}?token=${encodeURIComponent(rememberedAction.token)}`,
  );
  await new Promise<void>((resolve, reject) => {
    oldSocket.addEventListener("open", () => resolve());
    oldSocket.addEventListener("error", () =>
      reject(new Error("Old subscription did not open")),
    );
  });
  oldSocket.addEventListener("message", (event) =>
    oldMessages.push(String(event.data)),
  );
  const latest = await start(false, remembered.resultId);
  assert.ok("resultId" in latest);
  assert.equal(latest.resultId, remembered.resultId);
  assert.notEqual(latest.sessionId, remembered.sessionId);
  const rememberedPath = `/api/v1/typebots/proTypebot/blocks/webhook/results/${remembered.resultId}/executeWebhook`;
  // An older session on the same result/block is not a delivery target.
  assert.equal(
    (await post(rememberedPath, { answer: "wrong-session" }, true)).status,
    502,
  );
  const latestAction = getAction(latest.clientSideActions);
  const latestListener = listenForWebhook({
    room: latestAction.room,
    token: latestAction.token,
    context: {
      sessionId: latest.sessionId,
      isPreview: false,
      wsHost: "localhost:5292",
    },
  });
  await setTimeout(300);
  assert.equal(
    (await post(rememberedPath, { answer: "latest-only" }, true)).status,
    200,
  );
  const latestReply = await Promise.race([
    latestListener,
    setTimeout(5000).then(() => {
      throw new Error("No response for selected session");
    }),
  ]);
  assert.equal(
    (await continueChat(latest.sessionId, latestReply.replyToSend)).status,
    200,
  );
  assert.equal(
    (await continueChat(remembered.sessionId, latestReply.replyToSend)).status,
    400,
  );
  await setTimeout(100);
  assert.deepEqual(oldMessages, []);
  oldSocket.close();
  assert.deepEqual(
    (
      await prisma.chatSession.findUniqueOrThrow({
        where: { id: remembered.sessionId },
      })
    ).state,
    oldWait.state,
  );
  checks.push(
    "Offline or non-target listeners cause a retryable callback failure; retry delivers only to the selected session when two starts remember the same result",
  );

  const preview = await start(true);
  const previewAction = getAction(preview.clientSideActions);
  const previewListener = listenForWebhook({
    room: previewAction.room,
    token: previewAction.token,
    context: {
      sessionId: preview.sessionId,
      isPreview: true,
      wsHost: "localhost:5292",
    },
  });
  await setTimeout(300);
  assert.equal(
    (
      await post(
        "/api/v1/typebots/proTypebot/blocks/webhook/web/executeTestWebhook",
        { answer: "preview" },
        true,
      )
    ).status,
    200,
  );
  const previewReply = await Promise.race([
    previewListener,
    setTimeout(5000).then(() => {
      throw new Error("No preview response");
    }),
  ]);
  assert.equal(
    (await continueChat(preview.sessionId, previewReply.replyToSend)).status,
    200,
  );
  const previewState = sessionStateSchema.parse(
    (
      await prisma.chatSession.findUniqueOrThrow({
        where: { id: preview.sessionId },
      })
    ).state,
  );
  assert.equal(
    previewState.typebotsQueue[0].typebot.variables[0].value,
    "preview",
  );
  const subscriptionResponse = await fetch(`${origin}/subscription`, {
    headers: { Authorization: "Bearer fixture-owner" },
  });
  assert.equal(subscriptionResponse.status, 200);
  const subscription: unknown = await subscriptionResponse.json();
  assert.ok(
    subscription &&
      typeof subscription === "object" &&
      "token" in subscription &&
      typeof subscription.token === "string",
  );
  assert.equal(await connects(previewAction.room, subscription.token), true);
  assert.equal(
    await connects("seedUserId/another-bot/webhooks", subscription.token),
    false,
  );
  checks.push(
    "Authorized random-ID preview and builder test subscription work; another bot's preview channel is inaccessible",
  );

  const expired = await signWebhookToken(
    {
      purpose: "subscribe",
      room: action.room,
      blockId: "webhook",
      nonce: "expired",
      expiresAt: Date.now() - 1,
    },
    secret,
  );
  assert.equal(await connects(action.room, expired), false);
  assert.equal(
    await connects(
      action.room,
      await signWebhookToken(
        {
          purpose: "publish",
          room: action.room,
          blockId: "webhook",
          nonce: "wrong-purpose",
          expiresAt: Date.now() + 1000,
        },
        secret,
      ),
    ),
    false,
  );
  checks.push("Expired and wrong-purpose credentials fail closed");

  const { encrypt } = await import("../../packages/credentials/src/encrypt.ts");
  const encrypted = await encrypt({
    provider: "meta",
    systemUserAccessToken: "fixture-meta-token",
    phoneNumberId: "fixture-phone",
  });
  await prisma.credentials.create({
    data: {
      id: "fixture-wa",
      name: "Fixture",
      type: "whatsApp",
      workspaceId: "proWorkspace",
      data: encrypted.encryptedData,
      iv: encrypted.iv,
    },
  });
  await prisma.typebot.update({
    where: { id: "proTypebot" },
    data: { whatsAppCredentialsId: "fixture-wa" },
  });
  for (const preview of [false, true]) {
    const chat = await start(preview);
    const waSessionId = preview
      ? "wa-preview-33600000000"
      : "wa-fixture-phone-33600000000";
    const saved = sessionStateSchema.parse(
      (
        await prisma.chatSession.findUniqueOrThrow({
          where: { id: chat.sessionId },
        })
      ).state,
    );
    await prisma.chatSession.update({
      where: { id: chat.sessionId },
      data: {
        id: waSessionId,
        state: {
          ...saved,
          whatsApp: {
            contact: { name: "Fixture", phoneNumber: "33600000000" },
          },
        },
      },
    });
    if ("resultId" in chat && chat.resultId)
      await prisma.result.update({
        where: { id: chat.resultId },
        data: { lastChatSessionId: waSessionId },
      });
    assert.equal(
      (
        await continueChat(
          waSessionId,
          JSON.stringify({ data: { answer: "forged-wa" } }),
        )
      ).status,
      404,
    );
    const { continueBotFlow } = await import(
      "../../packages/bot-engine/src/continueBotFlow.ts"
    );
    const { SessionStore } = await import(
      "../../packages/runtime-session-store/src/index.ts"
    );
    const waState = sessionStateSchema.parse(
      (
        await prisma.chatSession.findUniqueOrThrow({
          where: { id: waSessionId },
        })
      ).state,
    );
    await assert.rejects(
      continueBotFlow(
        {
          type: "text",
          text: JSON.stringify({ data: { answer: "forged-wa" } }),
        },
        {
          version: 2,
          sessionId: waSessionId,
          state: waState,
          textBubbleContentFormat: "richText",
          sessionStore: new SessionStore(),
        },
      ),
      { code: "BAD_REQUEST" },
    );
    const endpoint = preview
      ? "/api/v1/typebots/proTypebot/blocks/webhook/whatsapp/33600000000/executeTestWebhook"
      : "/api/v1/typebots/proTypebot/blocks/webhook/results/" +
        ("resultId" in chat ? chat.resultId : "") +
        "/executeWebhook";
    const response = await post(
      endpoint,
      { answer: preview ? "wa-preview" : "wa-live" },
      true,
    );
    assert.equal(response.status, 200, await response.clone().text());
    const resumed = sessionStateSchema.parse(
      (
        await prisma.chatSession.findUniqueOrThrow({
          where: { id: waSessionId },
        })
      ).state,
    );
    assert.equal(resumed.currentBlockId, "next");
    assert.equal(
      resumed.typebotsQueue[0].typebot.variables[0].value,
      preview ? "wa-preview" : "wa-live",
    );
    assert.equal(resumed.pendingWebhook, undefined);
  }
  checks.push(
    "Production and preview WhatsApp endpoints sign and resume through the real converter/engine; visitor text is rejected (synthetic credentials, provider transport stubbed)",
  );

  const published = await prisma.publicTypebot.findUniqueOrThrow({
    where: { id: "proTypebot-public" },
  });
  await prisma.publicTypebot.update({
    where: { id: published.id },
    data: {
      groups: [
        {
          id: "group1",
          title: "Client HTTP",
          graphCoordinates: { x: 0, y: 0 },
          blocks: [
            {
              id: "http",
              type: "Webhook",
              options: {
                isExecutedOnClient: true,
                webhook: {
                  url: "http://localhost:5290/client-fixture",
                  method: "GET",
                },
                responseVariableMapping: [
                  {
                    id: "mapping",
                    variableId: "answer",
                    bodyPath: "data.answer",
                  },
                ],
              },
            },
            { id: "next", type: "text input" },
          ],
        },
      ],
    },
  });
  const httpChat = await start();
  const httpAction = httpChat.clientSideActions?.find(
    (action) => action.type === "httpRequestToExecute",
  );
  assert.ok(httpAction?.type === "httpRequestToExecute");
  const { executeHttpRequest } = await import(
    "../../packages/embeds/js/src/features/blocks/integrations/httpRequest/executeHttpRequest.ts"
  );
  const httpReply = await executeHttpRequest(
    httpAction.httpRequestToExecute,
    false,
  );
  assert.equal((await continueChat(httpChat.sessionId, httpReply)).status, 200);
  const httpState = sessionStateSchema.parse(
    (
      await prisma.chatSession.findUniqueOrThrow({
        where: { id: httpChat.sessionId },
      })
    ).state,
  );
  assert.equal(
    httpState.typebotsQueue[0].typebot.variables[0].value,
    "client-contract",
  );
  await prisma.publicTypebot.update({
    where: { id: published.id },
    data: { groups: published.groups ?? [] },
  });
  checks.push(
    "Explicit client-side HTTP Request still accepts its dedicated client result",
  );
  return {
    status: "passed",
    checks,
    scope:
      "Synthetic database and identities; actual engine, authenticated procedures, PartyKit runtime and embed listener. No production or provider requests.",
  };
};

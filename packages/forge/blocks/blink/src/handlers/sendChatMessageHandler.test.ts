import { afterEach, describe, expect, it } from "bun:test";
import type { LogsStore, VariableStore } from "@typebot.io/forge/types";
import {
  appIdentityTokenUrl,
  chatApiBaseUrl,
  minDelayBetweenChatRequestsMs,
} from "../constants";
import { sendChatMessageHandler } from "./sendChatMessageHandler";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("sendChatMessageHandler", () => {
  it("sends the message in a direct chat with each recipient", async () => {
    const requests = mockBlinkApi();

    const result = await executeSendChatMessage({
      userIds: '["u-1","u-2","u-1"]',
      message: "Fill in the survey: https://example.com",
    });

    expect(requests.tokenRequests).toBe(1);
    expect(requests.chatRequests).toEqual([
      {
        url: `${chatApiBaseUrl}/chats`,
        authorization: "Bearer access-token-1",
        body: {
          access_rule: { "@type": "private" },
          members: [
            { "@type": "app", app_identity_id: "aid-1" },
            { "@type": "user", user_id: "u-1" },
          ],
          organisation_id: "o-1",
        },
      },
      {
        url: `${chatApiBaseUrl}/chats/c-u-1/messages`,
        authorization: "Bearer access-token-1",
        body: {
          sender: { "@type": "app", app_identity_id: "aid-1" },
          body: {
            "@type": "markdown",
            markdown: "Fill in the survey: https://example.com",
          },
          unfurl_links: true,
        },
      },
      expect.objectContaining({ url: `${chatApiBaseUrl}/chats` }),
      expect.objectContaining({
        url: `${chatApiBaseUrl}/chats/c-u-2/messages`,
      }),
    ]);
    expect(result.variables).toEqual([
      { id: "sent-count", value: 2 },
      { id: "failed-user-ids", value: [] },
    ]);
    expect(result.logs).toEqual([
      {
        status: "success",
        description: "Blink chat message sent to 2 of 2 users.",
      },
    ]);
  });

  it("asks for App Identity credentials when given a legacy app token", async () => {
    const requests = mockBlinkApi();

    const result = await executeSendChatMessage({
      credentials: { apiKey: "legacy-token" },
      userIds: "u-1",
      message: "Hello",
    });

    expect(requests.tokenRequests).toBe(0);
    expect(result.variables).toEqual([
      { id: "sent-count", value: 0 },
      { id: "failed-user-ids", value: ["u-1"] },
    ]);
    expect(result.logs).toEqual([
      "Send Chat Message needs Blink credentials created from an App Identity (client ID and client secret).",
    ]);
  });

  it("keeps sending after a recipient fails and reports who was not reached", async () => {
    mockBlinkApi({
      respondToChatRequest: ({ userId }) =>
        userId === "u-2"
          ? Response.json({ title: "Forbidden" }, { status: 403 })
          : undefined,
    });

    const result = await executeSendChatMessage({
      userIds: "u-1, u-2, u-3",
      message: "Hello",
    });

    expect(result.variables).toEqual([
      { id: "sent-count", value: 2 },
      { id: "failed-user-ids", value: ["u-2"] },
    ]);
    expect(result.logs[0]).toEqual({
      status: "success",
      description: "Blink chat message sent to 2 of 3 users.",
    });
    expect(result.logs[1]).toMatchObject({
      context: "While sending Blink chat message (1 failed)",
    });
  });

  it("retries rate limited requests", async () => {
    let rateLimitedResponses = 0;
    const requests = mockBlinkApi({
      respondToChatRequest: () => {
        if (rateLimitedResponses > 0) return;
        rateLimitedResponses++;
        return new Response(null, { status: 429 });
      },
    });

    const result = await executeSendChatMessage({
      userIds: "u-1",
      message: "Hello",
    });

    expect(requests.chatRequests).toHaveLength(3);
    expect(result.variables).toEqual([
      { id: "sent-count", value: 1 },
      { id: "failed-user-ids", value: [] },
    ]);
  });

  it("stops when Blink rejects the access token", async () => {
    const requests = mockBlinkApi({
      respondToChatRequest: () =>
        Response.json({ title: "Unauthorized" }, { status: 401 }),
    });

    const result = await executeSendChatMessage({
      userIds: "u-1, u-2",
      message: "Hello",
    });

    expect(requests.chatRequests).toHaveLength(1);
    expect(result.variables).toEqual([
      { id: "sent-count", value: 0 },
      { id: "failed-user-ids", value: ["u-1", "u-2"] },
    ]);
    expect(result.logs[0]).toMatchObject({
      context: "While sending Blink chat message (1 failed, 1 not attempted)",
    });
  });

  it("refreshes the access token before it expires", async () => {
    const requests = mockBlinkApi({ accessTokenExpiresInSeconds: 1 });

    await executeSendChatMessage({ userIds: "u-1", message: "Hello" });

    expect(requests.chatRequests.map((r) => r.authorization)).toEqual([
      "Bearer access-token-2",
      "Bearer access-token-3",
    ]);
  });
  it("does not retry a message after a network error", async () => {
    const requests = mockBlinkApi({
      respondToChatRequest: () => {
        throw new TypeError("fetch failed");
      },
    });

    const result = await executeSendChatMessage({
      userIds: "u-1",
      message: "Hello",
    });

    expect(requests.chatRequests).toHaveLength(1);
    expect(result.variables).toEqual([
      { id: "sent-count", value: 0 },
      { id: "failed-user-ids", value: ["u-1"] },
    ]);
  });

  it("keeps requests spaced out when refreshing the access token", async () => {
    const requests = mockBlinkApi({
      accessTokenExpiresInSeconds: 1,
      tokenResponseDelayMs: 500,
    });

    await executeSendChatMessage({ userIds: "u-1", message: "Hello" });

    const [chatRequestTime, messageRequestTime] = requests.chatRequestTimes;
    expect(messageRequestTime! - chatRequestTime!).toBeGreaterThanOrEqual(
      minDelayBetweenChatRequestsMs - 5,
    );
  });

  it("reports every recipient as not sent when authentication fails", async () => {
    mockBlinkApi({
      respondToTokenRequest: () =>
        Response.json({ error: "invalid_client" }, { status: 401 }),
    });

    const result = await executeSendChatMessage({
      userIds: "u-1, u-2",
      message: "Hello",
    });

    expect(result.variables).toEqual([
      { id: "sent-count", value: 0 },
      { id: "failed-user-ids", value: ["u-1", "u-2"] },
    ]);
    expect(result.logs[0]).toMatchObject({
      context: "While authenticating Blink App Identity",
    });
  });
});

const executeSendChatMessage = async ({
  credentials = { clientId: "aid-1", clientSecret: "client-secret" },
  userIds,
  message,
}: {
  credentials?: { apiKey?: string; clientId?: string; clientSecret?: string };
  userIds: string;
  message: string;
}) => {
  const logs: unknown[] = [];
  const variables: { id: string; value: unknown }[] = [];
  await sendChatMessageHandler.server?.({
    credentials,
    options: Object.assign(Object.create(null), {
      userIds,
      message,
      responseMapping: [
        { item: "Sent count", variableId: "sent-count" },
        { item: "Failed user IDs", variableId: "failed-user-ids" },
      ],
    }),
    variables: createVariablesStore(variables),
    logs: createLogsStore(logs),
    sessionStore: Object.create(null),
  });
  return { logs, variables };
};

const mockBlinkApi = ({
  accessTokenExpiresInSeconds = 300,
  tokenResponseDelayMs = 0,
  respondToTokenRequest = () => undefined,
  respondToChatRequest = () => undefined,
}: {
  accessTokenExpiresInSeconds?: number;
  tokenResponseDelayMs?: number;
  respondToTokenRequest?: () => Response | undefined;
  respondToChatRequest?: (request: {
    userId: string | undefined;
  }) => Response | undefined;
} = {}) => {
  const requests = {
    tokenRequests: 0,
    chatRequests: [] as {
      url: string;
      authorization: string | null;
      body: unknown;
    }[],
    chatRequestTimes: [] as number[],
  };
  globalThis.fetch = Object.assign(
    async (input: string | URL | Request, init?: RequestInit) => {
      const url = input instanceof Request ? input.url : input.toString();
      if (url === appIdentityTokenUrl) {
        requests.tokenRequests++;
        if (tokenResponseDelayMs > 0)
          await new Promise((resolve) =>
            setTimeout(resolve, tokenResponseDelayMs),
          );
        const customTokenResponse = respondToTokenRequest();
        if (customTokenResponse) return customTokenResponse;
        return Response.json({
          access_token: createAccessToken(
            `access-token-${requests.tokenRequests}`,
          ),
          expires_in: accessTokenExpiresInSeconds,
        });
      }
      requests.chatRequestTimes.push(Date.now());
      const body = await readJsonBody(init?.body);
      const authorization = new Headers(init?.headers).get("authorization");
      requests.chatRequests.push({
        url,
        authorization: authorization && parseFakeAccessToken(authorization),
        body,
      });
      const userId = findUserId(body);
      const customResponse = respondToChatRequest({ userId });
      if (customResponse) return customResponse;
      if (url.endsWith("/messages"))
        return Response.json({ message_id: { chat_id: "c" } }, { status: 201 });
      return Response.json({ chat_id: `c-${userId}` }, { status: 201 });
    },
    { preconnect: originalFetch.preconnect },
  );
  return requests;
};

const createAccessToken = (tokenId: string) =>
  [
    "header",
    Buffer.from(
      JSON.stringify({ organisation_id: "o-1", jti: tokenId }),
    ).toString("base64url"),
    "signature",
  ].join(".");

const parseFakeAccessToken = (authorization: string) => {
  const payload = authorization.replace("Bearer ", "").split(".")[1];
  if (!payload) return authorization;
  const { jti } = JSON.parse(Buffer.from(payload, "base64url").toString());
  return `Bearer ${jti}`;
};

const readJsonBody = async (body: RequestInit["body"]) => {
  if (!body) return undefined;
  return JSON.parse(await new Response(body).text());
};

const findUserId = (body: unknown) => {
  if (
    typeof body === "object" &&
    body !== null &&
    "members" in body &&
    Array.isArray(body.members)
  )
    return body.members.find(
      (member: { user_id?: string }) => member.user_id !== undefined,
    )?.user_id;
};

const createVariablesStore = (
  setVariables: { id: string; value: unknown }[],
): VariableStore => ({
  get: () => undefined,
  set: (variables) => {
    setVariables.push(...variables);
  },
  parse: (value) => value,
  list: () => [],
});

const createLogsStore = (logs: unknown[]): LogsStore => ({
  add: (log) => {
    logs.push(log);
  },
});

import { createServer } from "node:http";
import { createId } from "@paralleldrive/cuid2";
import test, { expect } from "@playwright/test";
import type {
  StartChatInput,
  StartPreviewChatInput,
  StartTypebot,
} from "@typebot.io/chat-api/schemas";
import { sessionStateSchema } from "@typebot.io/chat-session/schemas";
import { encrypt } from "@typebot.io/credentials/encrypt";
import { EventType } from "@typebot.io/events/constants";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { apiToken } from "@typebot.io/playwright/databaseSetup";
import prisma from "@typebot.io/prisma";
import { getTestAsset } from "@/test/utils/playwright";

test.describe.configure({ mode: "parallel" });

test.beforeEach(async () => {
  try {
    await importTypebotInDatabase(
      getTestAsset("typebots/chat/linkedBot.json"),
      {
        id: "chat-sub-bot",
        publicId: "chat-sub-bot-public",
      },
    );
    await importTypebotInDatabase(
      getTestAsset("typebots/chat/startingWithInput.json"),
      {
        id: "starting-with-input",
        publicId: "starting-with-input-public",
      },
    );
  } catch {
    /* empty */
  }
});

test("API chat execution should work on preview bot", async ({ request }) => {
  const typebotId = createId();
  const publicId = `${typebotId}-public`;
  await importTypebotInDatabase(getTestAsset("typebots/chat/main.json"), {
    id: typebotId,
    publicId,
  });

  let chatSessionId: string;

  await test.step("Can start and continue chat", async () => {
    const { sessionId, messages, input, resultId } = await (
      await request.post(`/api/v1/typebots/${typebotId}/preview/startChat`, {
        data: {
          isOnlyRegistering: false,
          isStreamEnabled: false,
          textBubbleContentFormat: "richText",
        } satisfies Omit<StartPreviewChatInput, "typebotId">,
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      })
    ).json();
    chatSessionId = sessionId;
    expect(resultId).toBeUndefined();
    expect(sessionId).toBeDefined();
    expect(messages[0].content.richText).toStrictEqual([
      { children: [{ text: "Hi there! 👋" }], type: "p" },
    ]);
    expect(messages[1].content.richText).toStrictEqual([
      { children: [{ text: "Welcome. What's your name?" }], type: "p" },
    ]);
    expect(input.type).toBe("text input");
  });

  await test.step("Can answer Name question", async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sessions/${chatSessionId}/continueChat`, {
        data: {
          message: "John",
        },
      })
    ).json();

    expect(messages[0].content.richText).toStrictEqual([
      {
        children: [{ text: "Nice to meet you " }, { text: "John" }],
        type: "p",
      },
    ]);
    expect(input.type).toBe("number input");
  });
});

test("API preview chat should initialize progress from a targeted override", async ({
  request,
}) => {
  const typebotId = createId();
  const publicId = `${typebotId}-public`;
  await importTypebotInDatabase(getTestAsset("typebots/chat/main.json"), {
    id: typebotId,
    publicId,
  });

  const response = await request.post(
    `/api/v1/typebots/${typebotId}/preview/startChat`,
    {
      data: {
        isOnlyRegistering: false,
        isStreamEnabled: false,
        isProgressBarEnabled: true,
        textBubbleContentFormat: "richText",
      } satisfies Omit<StartPreviewChatInput, "typebotId">,
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    },
  );

  expect(response.ok()).toBe(true);

  const responseBody = await response.json();
  const session = await prisma.chatSession.findUnique({
    where: { id: responseBody.sessionId },
    select: { state: true },
  });

  expect(responseBody.progress).toBeDefined();
  expect(responseBody.typebot.theme.general?.progressBar?.isEnabled).not.toBe(
    true,
  );
  expect(
    sessionStateSchema.parse(session?.state).progressMetadata,
  ).toBeDefined();
});

test("API template preview chat should start from a server-side template slug", async ({
  request,
}) => {
  const response = await request.post(
    "/api/v1/templates/lead-gen/preview/startChat",
    {
      data: {
        isOnlyRegistering: false,
        isStreamEnabled: false,
        textBubbleContentFormat: "richText",
      } satisfies Omit<StartPreviewChatInput, "typebotId">,
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    },
  );

  expect(response.ok()).toBe(true);

  const responseBody = await response.json();
  const session = await prisma.chatSession.findUnique({
    where: { id: responseBody.sessionId },
    select: { state: true },
  });

  expect(responseBody.messages[0].content.richText).toStrictEqual([
    {
      type: "p",
      children: [
        { text: "Welcome to " },
        { bold: true, text: "AA" },
        { text: " (Awesome Agency)" },
      ],
    },
  ]);
  expect(responseBody.input.type).toBe("choice input");
  expect(sessionStateSchema.parse(session?.state).workspaceId).toBe(
    "proWorkspace",
  );
});

test("API preview chat should not resolve credentials from a client-supplied workspace", async ({
  request,
}) => {
  const typebotId = createId();
  const publicId = `${typebotId}-public`;
  const victimCredentialsId = createId();
  const victimWorkspaceId = createId();
  const credentialSinkServer = await createCredentialSinkServer();

  try {
    await importTypebotInDatabase(getTestAsset("typebots/chat/main.json"), {
      id: typebotId,
      publicId,
    });

    const { encryptedData, iv } = await encrypt({
      apiKey: "sk-victim-api-key",
    });

    await prisma.workspace.create({
      data: {
        id: victimWorkspaceId,
        name: "Victim workspace",
      },
    });

    await prisma.credentials.create({
      data: {
        id: victimCredentialsId,
        name: "Victim OpenAI",
        type: "openai",
        data: encryptedData,
        iv,
        workspaceId: victimWorkspaceId,
      },
    });

    const response = await request.post(
      `/api/v1/typebots/${typebotId}/preview/startChat`,
      {
        data: {
          typebot: buildPreviewTypebot({
            id: "client-supplied-typebot",
            publicTypebotId: "client-supplied-public-typebot",
            workspaceId: victimWorkspaceId,
            blocks: [
              {
                id: "openai-block",
                type: "openai",
                options: {
                  credentialsId: victimCredentialsId,
                  action: "Create chat completion",
                  baseUrl: credentialSinkServer.baseUrl,
                  model: "gpt-4o-mini",
                  messages: [
                    {
                      role: "user",
                      content: "Say hello",
                    },
                  ],
                },
              },
            ],
          }),
          isOnlyRegistering: false,
          isStreamEnabled: false,
          textBubbleContentFormat: "richText",
        },
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      },
    );

    expect(response.ok()).toBe(true);

    const responseBody = await response.json();
    const session = await prisma.chatSession.findUnique({
      where: { id: responseBody.sessionId },
      select: { state: true },
    });

    expect(responseBody.messages[0].content.richText).toStrictEqual([
      { children: [{ text: "Hi there! 👋" }], type: "p" },
    ]);
    expect(sessionStateSchema.parse(session?.state).workspaceId).not.toBe(
      victimWorkspaceId,
    );
    expect(credentialSinkServer.requestCount()).toBe(0);
  } finally {
    await credentialSinkServer.close();
    await prisma.workspace.deleteMany({
      where: { id: victimWorkspaceId },
    });
  }
});

test("API chat execution should work on published bot", async ({ request }) => {
  const typebotId = createId();
  const publicId = `${typebotId}-public`;
  await importTypebotInDatabase(getTestAsset("typebots/chat/main.json"), {
    id: typebotId,
    publicId,
  });

  let chatSessionId: string;

  await test.step("Start the chat", async () => {
    const { sessionId, messages, input, resultId } = await (
      await request.post(`/api/v1/typebots/${publicId}/startChat`, {
        data: {
          isOnlyRegistering: false,
          isStreamEnabled: false,
          textBubbleContentFormat: "richText",
        } satisfies Omit<StartChatInput, "publicId">,
      })
    ).json();
    chatSessionId = sessionId;
    expect(resultId).toBeDefined();
    const result = await prisma.result.findUnique({
      where: {
        id: resultId,
      },
    });
    expect(result).toBeDefined();
    expect(sessionId).toBeDefined();
    expect(messages[0].content.richText).toStrictEqual([
      { children: [{ text: "Hi there! 👋" }], type: "p" },
    ]);
    expect(messages[1].content.richText).toStrictEqual([
      { children: [{ text: "Welcome. What's your name?" }], type: "p" },
    ]);
    expect(input.type).toBe("text input");
  });

  await test.step("Answer Name question", async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sessions/${chatSessionId}/continueChat`, {
        data: { message: "John" },
      })
    ).json();
    expect(messages[0].content.richText).toStrictEqual([
      {
        type: "p",
        children: [
          { text: "Nice to meet you " },
          {
            text: "John",
          },
        ],
      },
    ]);
    expect(messages[1].content.url).toMatch(/giphy.com/gm);
    expect(input.type).toBe("number input");
  });

  await test.step("Answer Age question", async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sessions/${chatSessionId}/continueChat`, {
        data: { message: "24" },
      })
    ).json();
    expect(messages[0].content.richText).toStrictEqual([
      { children: [{ text: "Ok, you are an adult then 😁" }], type: "p" },
    ]);
    expect(messages[1].content.richText).toStrictEqual([
      {
        children: [
          { text: "My magic number is " },
          {
            text: "42",
          },
        ],
        type: "p",
      },
    ]);
    expect(messages[2].content.richText).toStrictEqual([
      {
        children: [{ text: "How would you rate the experience so far?" }],
        type: "p",
      },
    ]);
    expect(input.type).toBe("rating input");
  });

  await test.step("Answer Rating question", async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sessions/${chatSessionId}/continueChat`, {
        data: { message: "8" },
      })
    ).json();
    expect(messages[0].content.richText).toStrictEqual([
      {
        children: [{ text: "I'm gonna shoot multiple inputs now..." }],
        type: "p",
      },
    ]);
    expect(input.type).toBe("email input");
  });

  await test.step("Answer Email question with wrong input", async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sessions/${chatSessionId}/continueChat`, {
        data: { message: "invalid email" },
      })
    ).json();
    expect(messages[0].content.richText).toStrictEqual([
      {
        children: [
          {
            text: "This email doesn't seem to be valid. Can you type it again?",
          },
        ],
        type: "p",
      },
    ]);
    expect(input.type).toBe("email input");
  });

  await test.step("Answer Email question with valid input", async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sessions/${chatSessionId}/continueChat`, {
        data: { message: "typebot@email.com" },
      })
    ).json();
    expect(messages.length).toBe(0);
    expect(input.type).toBe("url input");
  });

  await test.step("Answer URL question", async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sessions/${chatSessionId}/continueChat`, {
        data: { message: "https://typebot.io" },
      })
    ).json();
    expect(messages.length).toBe(0);
    expect(input.type).toBe("choice input");
  });

  await test.step("Answer Buttons question with invalid choice", async () => {
    const { messages } = await (
      await request.post(`/api/v1/sessions/${chatSessionId}/continueChat`, {
        data: { message: "Yes" },
      })
    ).json();
    expect(messages[0].content.richText).toStrictEqual([
      {
        children: [
          {
            text: "Ok, you are solid 👏",
          },
        ],
        type: "p",
      },
    ]);
    expect(messages[1].content.richText).toStrictEqual([
      {
        children: [
          {
            text: "Let's trigger a webhook...",
          },
        ],
        type: "p",
      },
    ]);
  });
  await test.step("Starting with a message when typebot starts with input should proceed", async () => {
    const response = await (
      await request.post(
        "/api/v1/typebots/starting-with-input-public/startChat",
        {
          data: {
            //@ts-expect-error We want to test if message is correctly preprocessed by zod
            message: "Hey",
            isStreamEnabled: false,
            isOnlyRegistering: false,
            textBubbleContentFormat: "richText",
          } satisfies Omit<StartChatInput, "publicId">,
        },
      )
    ).json();
    expect(response.messages[0].content.richText).toStrictEqual([
      {
        children: [
          {
            text: "That's nice!",
          },
        ],
        type: "p",
      },
    ]);
  });
  await test.step("Markdown text bubble format should work", async () => {
    const { messages } = await (
      await request.post(`/api/v1/typebots/${typebotId}/preview/startChat`, {
        data: {
          isOnlyRegistering: false,
          isStreamEnabled: false,
          textBubbleContentFormat: "markdown",
        } satisfies Omit<StartPreviewChatInput, "typebotId">,
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      })
    ).json();
    expect(messages[0].content.markdown).toStrictEqual("Hi there! 👋");
    expect(messages[1].content.markdown).toStrictEqual(
      "Welcome. What's your name?",
    );
  });
});

type PreviewTypebot = StartTypebot;

const buildPreviewTypebot = ({
  id,
  publicTypebotId,
  workspaceId,
  blocks,
}: {
  id: string;
  publicTypebotId: string;
  workspaceId: string;
  blocks: PreviewTypebot["groups"][number]["blocks"];
}): PreviewTypebot => ({
  version: "6.1",
  id,
  publicTypebotId,
  workspaceId,
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  settings: {},
  theme: {},
  variables: [],
  events: [
    {
      id: "start-event",
      type: EventType.START,
      graphCoordinates: { x: 0, y: 0 },
      outgoingEdgeId: "start-edge",
    },
  ],
  groups: [
    {
      id: "group",
      title: "Group",
      graphCoordinates: { x: 0, y: 0 },
      blocks,
    },
  ],
  edges: [
    {
      id: "start-edge",
      from: { eventId: "start-event" },
      to: { groupId: "group" },
    },
  ],
});

const createCredentialSinkServer = async () => {
  let requestCount = 0;

  const server = createServer((_request, response) => {
    requestCount += 1;
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ choices: [] }));
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Could not start credential sink server");

  return {
    baseUrl: `http://127.0.0.1:${address.port}/v1`,
    requestCount: () => requestCount,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
  };
};

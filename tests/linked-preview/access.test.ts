import { afterAll, beforeAll, expect, spyOn, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { typebotLinkBlockSchema } from "@typebot.io/blocks-logic/typebotLink/schema";
import { sessionStateSchema } from "@typebot.io/chat-session/schemas";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import { withSessionStore } from "@typebot.io/runtime-session-store";

// Never fall back to the developer's DATABASE_URL or authenticated browser data.
const databaseUrl = new URL(process.env.LINK_PREVIEW_TEST_DATABASE_URL ?? "");
if (
  !["localhost", "127.0.0.1"].includes(databaseUrl.hostname) ||
  !databaseUrl.pathname.endsWith("/typebot_link_qa")
)
  throw new Error("Use a dedicated loopback typebot_link_qa database");
process.env.DATABASE_URL = databaseUrl.href;
const { default: prisma } = await import("@typebot.io/prisma");
const { handleStartChatPreview, startPreviewChatInputSchema } = await import(
  "@typebot.io/bot-engine/api/handleStartChatPreview"
);
const { handleContinueChat, continueChatInputSchema } = await import(
  "@typebot.io/bot-engine/api/handleContinueChat"
);
const { executeTypebotLink } = await import(
  "@typebot.io/bot-engine/blocks/logic/typebotLink/executeTypebotLink"
);
const { fetchLinkedTypebots } = await import(
  "@typebot.io/bot-engine/blocks/logic/typebotLink/fetchLinkedTypebots"
);
const { fetchLinkedChildTypebots } = await import(
  "@typebot.io/bot-engine/blocks/logic/typebotLink/fetchLinkedChildTypebots"
);
const httpRequest = await import(
  "@typebot.io/bot-engine/blocks/integrations/httpRequest/executeHttpRequestBlock"
);
const { handleTestHttpRequest } = await import(
  "../../apps/builder/src/features/blocks/integrations/httpRequest/api/handleTestHttpRequest"
);
const prefix = randomUUID();
const workspaceId = `${prefix}-workspace`;
const guest = `${prefix}-guest`;
const member = `${prefix}-member`;
const owner = `${prefix}-owner`;
const outsider = `${prefix}-outsider`;
const collaborator = `${prefix}-collaborator`;
const entryId = `${prefix}-entry`;
const sharedId = `${prefix}-shared`;
const privateId = `${prefix}-private`;
const sessions: string[] = [];
const coordinates = { x: 0, y: 0 };
const link = (typebotId: string) =>
  typebotLinkBlockSchema.parse({
    id: "link",
    type: LogicBlockType.TYPEBOT_LINK,
    options: { typebotId, groupId: "target" },
  });
const draft = (id: string, label: string) => ({
  id,
  workspaceId,
  name: label,
  version: "6.1",
  theme: {},
  settings: {},
  events: [
    {
      id: "start",
      type: "start",
      graphCoordinates: coordinates,
      outgoingEdgeId: "start-edge",
    },
  ],
  edges: [
    { id: "start-edge", from: { eventId: "start" }, to: { groupId: "target" } },
  ],
  variables: [],
  groups: [
    {
      id: "target",
      title: label,
      graphCoordinates: coordinates,
      blocks: [
        {
          id: "message",
          type: "text",
          content: { richText: [{ type: "p", children: [{ text: label }] }] },
        },
        { id: "answer", type: "text input" },
      ],
    },
  ],
});
const state = (previewUserId?: string) =>
  sessionStateSchema.parse({
    version: "3",
    workspaceId,
    previewUserId,
    typebotsQueue: [{ typebot: draft(entryId, "Entry"), answers: [] }],
  });
const start = async (userId: string) => {
  const response = await handleStartChatPreview({
    input: startPreviewChatInputSchema.parse({ typebotId: entryId }),
    context: { user: { id: userId } },
  });
  sessions.push(response.sessionId);
  return response;
};
const continuePreview = (sessionId: string) =>
  handleContinueChat({
    input: continueChatInputSchema.parse({
      sessionId,
      message: { type: "text", text: "go" },
    }),
    context: {},
  });

beforeAll(async () => {
  for (const id of [guest, member, owner, outsider, collaborator])
    await prisma.user.create({
      data: { id, email: `${id}@example.test`, onboardingCategories: [] },
    });
  await prisma.workspace.create({
    data: {
      id: workspaceId,
      name: "Linked preview QA",
      members: {
        create: [
          { userId: guest, role: WorkspaceRole.GUEST },
          { userId: member, role: WorkspaceRole.MEMBER },
          { userId: owner, role: WorkspaceRole.ADMIN },
        ],
      },
    },
  });
  await prisma.typebot.create({ data: draft(sharedId, "SHARED_DRAFT") });
  await prisma.typebot.create({
    data: draft(privateId, "PRIVATE_DRAFT_SENTINEL"),
  });
  const entry = draft(entryId, "Entry");
  await prisma.typebot.create({
    data: {
      ...entry,
      groups: [
        {
          id: "target",
          title: "Entry",
          graphCoordinates: coordinates,
          blocks: [{ id: "pause", type: "text input" }, link(privateId)],
        },
      ],
    },
  });
  await prisma.collaboratorsOnTypebots.createMany({
    data: [
      { userId: guest, typebotId: entryId, type: "WRITE" },
      { userId: guest, typebotId: sharedId, type: "READ" },
      { userId: collaborator, typebotId: entryId, type: "READ" },
      { userId: collaborator, typebotId: sharedId, type: "WRITE" },
    ],
  });
});

afterAll(async () => {
  await prisma.chatSession.deleteMany({ where: { id: { in: sessions } } });
  await prisma.workspace.delete({ where: { id: workspaceId } });
  await prisma.user.deleteMany({
    where: { id: { in: [guest, member, owner, outsider, collaborator] } },
  });
  await prisma.$disconnect();
});

for (const [label, userId, allowed] of [
  ["guest", guest, [sharedId]],
  ["member", member, [sharedId, privateId]],
  ["owner", owner, [sharedId, privateId]],
  ["explicit outsider collaborator", collaborator, [sharedId]],
  ["outsider", outsider, []],
  ["anonymous", undefined, []],
] as const)
  test(`linked draft access: ${label}`, async () => {
    const bots = await fetchLinkedTypebots({
      isPreview: true,
      userId,
      typebotIds: [sharedId, privateId],
    });
    expect(bots.map((bot) => bot.id).sort()).toEqual([...allowed].sort());
    for (const targetId of [sharedId, privateId]) {
      const result = await withSessionStore(randomUUID(), (sessionStore) =>
        executeTypebotLink(link(targetId), {
          state: state(userId),
          sessionStore,
        }),
      );
      expect(result.newSessionState?.typebotsQueue[0].typebot.id).toBe(
        allowed.some((id) => id === targetId) ? targetId : undefined,
      );
      if (!allowed.some((id) => id === targetId))
        expect(JSON.stringify(result)).not.toContain("PRIVATE_DRAFT_SENTINEL");
    }
  });

test("real start and persisted continuation deny the guest and allow the member", async () => {
  for (const userId of [guest, member]) {
    const response = await start(userId);
    expect(response.input?.id).toBe("pause");
    const saved = await prisma.chatSession.findUniqueOrThrow({
      where: { id: response.sessionId },
    });
    expect(sessionStateSchema.parse(saved.state).previewUserId).toBe(userId);
    const continued = await continuePreview(response.sessionId);
    expect(JSON.stringify(continued).includes("PRIVATE_DRAFT_SENTINEL")).toBe(
      userId === member,
    );
  }
  await expect(start(outsider)).rejects.toThrow("Typebot not found");
});

test("shared drafts execute through real start and continuation for explicit collaborators", async () => {
  await prisma.typebot.update({
    where: { id: entryId },
    data: {
      groups: [
        {
          id: "target",
          title: "Entry",
          graphCoordinates: coordinates,
          blocks: [{ id: "pause", type: "text input" }, link(sharedId)],
        },
      ],
    },
  });
  for (const userId of [guest, collaborator]) {
    const response = await start(userId);
    expect(JSON.stringify(await continuePreview(response.sessionId))).toContain(
      "SHARED_DRAFT",
    );
  }
  await prisma.typebot.update({
    where: { id: entryId },
    data: {
      groups: [
        {
          id: "target",
          title: "Entry",
          graphCoordinates: coordinates,
          blocks: [link(privateId)],
        },
      ],
    },
  });
  expect(JSON.stringify(await start(guest))).not.toContain(
    "PRIVATE_DRAFT_SENTINEL",
  );
  expect(JSON.stringify(await start(member))).toContain(
    "PRIVATE_DRAFT_SENTINEL",
  );
});

test("target collaboration is checked again after start", async () => {
  await prisma.typebot.update({
    where: { id: entryId },
    data: {
      groups: [
        {
          id: "target",
          title: "Entry",
          graphCoordinates: coordinates,
          blocks: [{ id: "pause", type: "text input" }, link(sharedId)],
        },
      ],
    },
  });
  const response = await start(guest);
  await prisma.collaboratorsOnTypebots.delete({
    where: { userId_typebotId: { userId: guest, typebotId: sharedId } },
  });
  try {
    expect(
      JSON.stringify(await continuePreview(response.sessionId)),
    ).not.toContain("SHARED_DRAFT");
  } finally {
    await prisma.collaboratorsOnTypebots.create({
      data: { userId: guest, typebotId: sharedId, type: "READ" },
    });
  }
});

test("recursive expansion stops before an unshared child", async () => {
  await prisma.typebot.update({
    where: { id: sharedId },
    data: {
      groups: [
        {
          id: "target",
          title: "Shared",
          graphCoordinates: coordinates,
          blocks: [link(privateId)],
        },
      ],
    },
  });
  const bots = await fetchLinkedChildTypebots({
    isPreview: true,
    userId: guest,
    typebots: [
      {
        groups: [
          {
            id: "entry",
            title: "Entry",
            graphCoordinates: coordinates,
            blocks: [link(sharedId)],
          },
        ],
      },
    ],
  })([]);
  expect(bots.map((bot) => bot.id)).toEqual([sharedId]);
});

test("HTTP test excludes private linked draft fields from the outbound sample", async () => {
  await prisma.typebot.update({
    where: { id: entryId },
    data: {
      groups: [
        {
          id: "target",
          title: "Entry",
          graphCoordinates: coordinates,
          blocks: [
            link(privateId),
            {
              id: "http",
              type: "Webhook",
              options: {
                webhook: {
                  url: "https://example.test/fixture",
                  method: "POST",
                },
              },
            },
          ],
        },
      ],
    },
  });
  const send = spyOn(httpRequest, "executeHttpRequest").mockImplementation(
    async (request) => ({ response: { statusCode: 200, data: request.body } }),
  );
  try {
    for (const userId of [guest, member, outsider]) {
      send.mockClear();
      const request = handleTestHttpRequest({
        input: { typebotId: entryId, blockId: "http" },
        context: { user: { id: userId, email: `${userId}@example.test` } },
      });
      if (userId === outsider) {
        await expect(request).rejects.toThrow("Typebot not found");
        expect(send).not.toHaveBeenCalled();
      } else {
        const response = await request;
        expect(send).toHaveBeenCalledTimes(1);
        expect(
          JSON.stringify(response).includes("PRIVATE_DRAFT_SENTINEL"),
        ).toBe(userId === member);
      }
    }
  } finally {
    send.mockRestore();
  }
});

test("self links remain available without stored identity; legacy external links fail closed", async () => {
  const result = await withSessionStore(randomUUID(), (sessionStore) =>
    executeTypebotLink(link("current"), { state: state(), sessionStore }),
  );
  expect(result.newSessionState?.typebotsQueue[0].typebot.id).toBe(entryId);
  const resultWithoutIdentity = await withSessionStore(
    randomUUID(),
    (sessionStore) =>
      executeTypebotLink(link(privateId), { state: state(), sessionStore }),
  );
  expect(resultWithoutIdentity.newSessionState).toBeUndefined();
});

test("dynamic group names use the same linked-bot authorization", async () => {
  const dynamicLink = {
    ...link(privateId),
    options: { typebotId: privateId, groupId: "{{Destination}}" },
  };
  for (const userId of [guest, member]) {
    const initialState = state(userId);
    initialState.typebotsQueue[0].typebot.variables = [
      {
        id: "destination",
        name: "Destination",
        value: "PRIVATE_DRAFT_SENTINEL",
      },
    ];
    const response = await withSessionStore(randomUUID(), (sessionStore) =>
      executeTypebotLink(dynamicLink, { state: initialState, sessionStore }),
    );
    expect(response.newSessionState?.typebotsQueue[0].typebot.id).toBe(
      userId === member ? privateId : undefined,
    );
  }
});

test("published links still use the published snapshot without a preview user", async () => {
  const {
    workspaceId: _workspaceId,
    name: _name,
    id: _id,
    ...snapshot
  } = draft(privateId, "PUBLISHED_SNAPSHOT");
  await prisma.publicTypebot.create({
    data: { ...snapshot, typebotId: privateId },
  });
  const initialState = state();
  initialState.typebotsQueue[0].resultId = "existing-live-result";
  initialState.typebotsQueue[0].answers = [
    { key: "existing", value: "answer" },
  ];
  const response = await withSessionStore(randomUUID(), (sessionStore) =>
    executeTypebotLink(link(privateId), { state: initialState, sessionStore }),
  );
  expect(JSON.stringify(response)).toContain("PUBLISHED_SNAPSHOT");
  expect(JSON.stringify(response)).not.toContain("PRIVATE_DRAFT_SENTINEL");
  const bots = await fetchLinkedTypebots({
    isPreview: false,
    userId: undefined,
    typebotIds: [privateId],
  });
  expect(JSON.stringify(bots)).toContain("PUBLISHED_SNAPSHOT");
  expect(
    await fetchLinkedTypebots({
      isPreview: true,
      userId: undefined,
      typebotIds: [privateId],
    }),
  ).toEqual([]);
});

test("a user previewing their own workspace cannot link into the target workspace", async () => {
  const ownWorkspaceId = `${prefix}-own-workspace`;
  await prisma.workspace.create({
    data: {
      id: ownWorkspaceId,
      name: "Own workspace",
      members: { create: { userId: guest, role: WorkspaceRole.ADMIN } },
    },
  });
  try {
    const initialState = state(guest);
    initialState.workspaceId = ownWorkspaceId;
    const response = await withSessionStore(randomUUID(), (sessionStore) =>
      executeTypebotLink(link(sharedId), { state: initialState, sessionStore }),
    );
    expect(response.newSessionState).toBeUndefined();
  } finally {
    await prisma.workspace.delete({ where: { id: ownWorkspaceId } });
  }
});

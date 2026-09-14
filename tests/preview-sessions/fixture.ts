import { mock } from "bun:test";

// This suite must run in its own process: normal bot-engine tests mock storage.
// Only bot lookup and the unused JS isolate are stubbed. The engine and storage are real.
const databaseUrl = process.env.PREVIEW_SESSION_TEST_DATABASE_URL;
if (
  !databaseUrl ||
  !["localhost", "127.0.0.1"].includes(new URL(databaseUrl).hostname)
)
  throw new Error(
    "Set PREVIEW_SESSION_TEST_DATABASE_URL to a disposable local PostgreSQL database",
  );
process.env.DATABASE_URL = databaseUrl;
process.env.SKIP_ENV_CHECK = "true";

mock.module("isolated-vm", () => ({
  default: {},
  Isolate: class {},
  Context: class {},
  Reference: class {},
  ExternalCopy: class {},
}));
const { sessionStateSchema } = await import(
  "../../packages/chat-session/src/schemas"
);
const state = sessionStateSchema.parse({
  version: "3",
  workspaceId: "synthetic-attacker-workspace",
  typebotsQueue: [
    {
      typebot: {
        id: "synthetic-attacker-bot",
        version: "6.1",
        groups: [
          {
            id: "input-group",
            title: "Input",
            graphCoordinates: { x: 0, y: 0 },
            blocks: [{ id: "input", type: "text input" }],
          },
        ],
        events: [
          {
            id: "start",
            outgoingEdgeId: "start-edge",
            type: "start",
            graphCoordinates: { x: 0, y: 0 },
          },
        ],
        edges: [
          {
            id: "start-edge",
            from: { eventId: "start" },
            to: { groupId: "input-group" },
          },
        ],
        variables: [],
      },
      answers: [],
    },
  ],
});
const typebot = {
  updatedAt: new Date(),
  ...state.typebotsQueue[0].typebot,
  workspaceId: state.workspaceId,
  theme: {},
  settings: {},
};
mock.module("../../packages/bot-engine/src/queries/findTypebot", () => ({
  findTypebot: async () => typebot,
}));
mock.module("@typebot.io/templates/typebots", () => ({
  getTemplateWithTypebotBySlug: () => ({ typebot }),
}));
const { default: prisma } = await import("../../packages/prisma/src");
const { JsonNull } = await import("../../packages/prisma/src/enum");
const {
  handleStartChatPreview,
  handleStartTemplatePreviewChat,
  startPreviewChatInputSchema,
  startTemplatePreviewChatInputSchema,
} = await import("../../packages/bot-engine/src/api/handleStartChatPreview");
const { handleSendMessageV1 } = await import(
  "../../packages/bot-engine/src/api/legacy/handleSendMessageV1"
);
const { handleSendMessageV2 } = await import(
  "../../packages/bot-engine/src/api/legacy/handleSendMessageV2"
);
const { saveStateToDatabase } = await import(
  "../../packages/bot-engine/src/saveStateToDatabase"
);

const { handleContinueChat, continueChatInputSchema } = await import(
  "../../packages/bot-engine/src/api/handleContinueChat"
);

export {
  continueChatInputSchema,
  handleContinueChat,
  handleSendMessageV1,
  handleSendMessageV2,
  handleStartChatPreview,
  handleStartTemplatePreviewChat,
  JsonNull,
  prisma,
  saveStateToDatabase,
  startPreviewChatInputSchema,
  startTemplatePreviewChatInputSchema,
  state,
};

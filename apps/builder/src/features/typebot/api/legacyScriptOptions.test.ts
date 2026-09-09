import { beforeEach, expect, it, mock } from "bun:test";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { clientSideActionSchema } from "@typebot.io/chat-api/clientSideAction";
import {
  CollaborationType,
  Plan,
  WorkspaceRole,
} from "@typebot.io/prisma/enum";
import { typebotV6Schema } from "@typebot.io/typebot/schemas/typebot";

process.env.SKIP_ENV_CHECK = "true";
const create = mock();
const update = mock();
const findFirst = mock();
const workspace = {
  id: "workspace",
  plan: Plan.FREE,
  isSuspended: false,
  isPastDue: false,
  members: [{ userId: "owner", role: WorkspaceRole.ADMIN }],
};
const stored = typebotV6Schema.parse({
  id: "bot",
  version: "6.1",
  name: "Script safety",
  workspaceId: workspace.id,
  groups: [],
  variables: [],
  edges: [],
  theme: {},
  settings: {},
  events: [{ id: "start", type: "start", graphCoordinates: { x: 0, y: 0 } }],
  createdAt: new Date(),
  updatedAt: new Date(),
  icon: null,
  folderId: null,
  publicId: null,
  customDomain: null,
  resultsTablePreferences: null,
  selectedThemeTemplateId: null,
  whatsAppCredentialsId: null,
  riskLevel: null,
  spaceId: null,
  isArchived: false,
  isClosed: false,
});
mock.module("@typebot.io/prisma", () => ({
  default: {
    workspace: { findUnique: async () => workspace },
    typebot: { create, update, findFirst },
  },
}));
mock.module("@typebot.io/telemetry/trackEvents", () => ({
  trackEvents: async () => {},
}));
mock.module("@typebot.io/lib/s3/copyObjects", () => ({
  copyObjects: async () => {},
}));

const { handleCreateTypebot, createTypebotInputSchema } = await import(
  "./handleCreateTypebot"
);
const { handleUpdateTypebot, updateTypebotInputSchema } = await import(
  "./handleUpdateTypebot"
);
const { handleImportTypebot, importTypebotInputSchema } = await import(
  "./handleImportTypebot"
);

beforeEach(() => {
  create.mockReset();
  update.mockReset();
  findFirst.mockReset();
  // Stop at the persistence boundary: inspect the exact write, without mocking
  // the sanitizer, authorization, input schema, or import migration.
  create.mockRejectedValue(new Error("persist"));
  update.mockRejectedValue(new Error("persist"));
  findFirst.mockResolvedValue({
    ...stored,
    workspace,
    collaborators: [{ userId: "collaborator", type: CollaborationType.WRITE }],
  });
});

const groups = [
  {
    id: "group",
    title: "Scripts",
    graphCoordinates: { x: 100, y: 0 },
    blocks: [
      {
        id: "code",
        type: LogicBlockType.SCRIPT,
        options: {
          content: 'return "ok"',
          isUnsafe: false,
          isExecutedOnClient: true,
        },
      },
      {
        id: "variable",
        type: LogicBlockType.SET_VARIABLE,
        options: {
          type: "Custom",
          isCode: true,
          expressionToEvaluate: "40 + 2",
          isUnsafe: true,
          isExecutedOnClient: false,
        },
      },
    ],
  },
];

const expectLegacyFlagsRemoved = (value: unknown) => {
  expect(value).toMatchObject([
    {
      blocks: [
        { options: { content: 'return "ok"', isExecutedOnClient: true } },
        {
          options: {
            expressionToEvaluate: "40 + 2",
            isCode: true,
            isExecutedOnClient: false,
          },
        },
      ],
    },
  ]);
  expect(JSON.stringify(value)).not.toContain('"isUnsafe"');
};

it("loads stored bots with or without legacy flags", () => {
  const parsed = typebotV6Schema.parse({ ...stored, groups });
  expectLegacyFlagsRemoved(parsed.groups);
  expect(typebotV6Schema.parse(parsed)).toEqual(parsed);
});

it("create drops legacy flags before persistence", async () => {
  await expect(
    handleCreateTypebot({
      input: createTypebotInputSchema.parse({
        workspaceId: workspace.id,
        typebot: { groups },
      }),
      context: { user: { id: "owner" } },
    }),
  ).rejects.toThrow("persist");
  expectLegacyFlagsRemoved(create.mock.calls[0][0].data.groups);
});

it("WRITE collaborator update drops legacy flags before persistence", async () => {
  await expect(
    handleUpdateTypebot({
      input: updateTypebotInputSchema.parse({
        typebotId: stored.id,
        typebot: { groups },
      }),
      context: { user: { id: "collaborator" } },
    }),
  ).rejects.toThrow("persist");
  expectLegacyFlagsRemoved(update.mock.calls[0][0].data.groups);
});

it("import ignores the retired safety opt-out", async () => {
  const input = importTypebotInputSchema.parse({
    workspaceId: workspace.id,
    typebot: { ...stored, groups },
    enableSafetyFlags: false,
  });
  expect(input).not.toHaveProperty("enableSafetyFlags");
  await expect(
    handleImportTypebot({ input, context: { user: { id: "owner" } } }),
  ).rejects.toThrow("persist");
  expectLegacyFlagsRemoved(create.mock.calls[0][0].data.groups);
});

it("still rejects a read-only collaborator", async () => {
  findFirst.mockResolvedValue({
    ...stored,
    workspace,
    collaborators: [{ userId: "collaborator", type: CollaborationType.READ }],
  });
  await expect(
    handleUpdateTypebot({
      input: { typebotId: stored.id, typebot: { groups: [] } },
      context: { user: { id: "collaborator" } },
    }),
  ).rejects.toMatchObject({ code: "NOT_FOUND" });
  expect(update).not.toHaveBeenCalled();
});

it("accepts legacy action flags for clients on either side of the rollout", () => {
  for (const action of [
    {
      type: "scriptToExecute",
      scriptToExecute: { content: "40 + 2", args: [], isUnsafe: false },
    },
    {
      type: "setVariable",
      setVariable: {
        scriptToExecute: { content: "40 + 2", args: [], isUnsafe: true },
      },
    },
  ]) {
    const parsed = clientSideActionSchema.parse(action);
    expect(parsed).toEqual(action);
    expect(JSON.stringify(parsed)).toContain('"content":"40 + 2"');
  }
});

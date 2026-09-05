import { beforeEach, describe, expect, it, mock } from "bun:test";
import { CollaborationType, WorkspaceRole } from "@typebot.io/prisma/enum";

const typebotFindFirst = mock();
const typebotUpdate = mock();
const webhookFindMany = mock();

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";

mock.module("@typebot.io/prisma", () => ({
  default: {
    typebot: { findFirst: typebotFindFirst, update: typebotUpdate },
    webhook: { findMany: webhookFindMany },
  },
}));

const { latestTypebotVersion } = await import("@typebot.io/schemas/versions");
const { typebotV6Schema } = await import("@typebot.io/typebot/schemas/typebot");
const { handleGetTypebot } = await import("./handleGetTypebot");

beforeEach(() => {
  typebotFindFirst.mockReset();
  typebotUpdate.mockReset();
  webhookFindMany.mockReset();
  webhookFindMany.mockResolvedValue([]);
});

describe("handleGetTypebot", () => {
  it("does not expose typebot content to a non-collaborating guest", async () => {
    typebotFindFirst.mockResolvedValue({
      id: "typebot-id",
      collaborators: [],
      workspace: {
        isSuspended: false,
        isPastDue: false,
        members: [{ userId: "guest-id", role: WorkspaceRole.GUEST }],
      },
    });

    await expect(
      handleGetTypebot({
        input: { typebotId: "typebot-id", migrateToLatestVersion: false },
        context: { user: { id: "guest-id", email: "guest@example.com" } },
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(typebotFindFirst).toHaveBeenCalledWith({
      where: { id: "typebot-id" },
      include: {
        collaborators: {
          where: { userId: "guest-id" },
          select: { userId: true, type: true },
        },
        workspace: {
          select: {
            isSuspended: true,
            isPastDue: true,
            members: {
              where: { userId: "guest-id" },
              select: { userId: true, role: true },
            },
          },
        },
      },
    });
  });
});

const user = { id: "user-id", email: "user@example.com" };

const accessScenarios = [
  {
    name: "anonymous public reader",
    user: null,
    publicShare: true,
    collaboration: undefined,
    role: undefined,
    canWrite: false,
  },
  {
    name: "authenticated public reader",
    user,
    publicShare: true,
    collaboration: undefined,
    role: undefined,
    canWrite: false,
  },
  {
    name: "READ collaborator",
    user,
    publicShare: false,
    collaboration: CollaborationType.READ,
    role: undefined,
    canWrite: false,
  },
  {
    name: "READ guest collaborator",
    user,
    publicShare: false,
    collaboration: CollaborationType.READ,
    role: WorkspaceRole.GUEST,
    canWrite: false,
  },
  {
    name: "public workspace guest",
    user,
    publicShare: true,
    collaboration: undefined,
    role: WorkspaceRole.GUEST,
    canWrite: false,
  },
  {
    name: "WRITE collaborator",
    user,
    publicShare: false,
    collaboration: CollaborationType.WRITE,
    role: undefined,
    canWrite: true,
  },
  {
    name: "FULL_ACCESS collaborator without workspace write permission",
    user,
    publicShare: false,
    collaboration: CollaborationType.FULL_ACCESS,
    role: undefined,
    canWrite: false,
  },
  {
    name: "WRITE guest collaborator",
    user,
    publicShare: false,
    collaboration: CollaborationType.WRITE,
    role: WorkspaceRole.GUEST,
    canWrite: true,
  },
  {
    name: "workspace admin",
    user,
    publicShare: false,
    collaboration: undefined,
    role: WorkspaceRole.ADMIN,
    canWrite: true,
  },
  {
    name: "workspace member",
    user,
    publicShare: false,
    collaboration: undefined,
    role: WorkspaceRole.MEMBER,
    canWrite: true,
  },
  {
    name: "READ collaborator with workspace write access",
    user,
    publicShare: false,
    collaboration: CollaborationType.READ,
    role: WorkspaceRole.MEMBER,
    canWrite: true,
  },
];

for (const version of ["3", "4", "5"]) {
  describe(`legacy v${version} migration`, () => {
    for (const scenario of accessScenarios) {
      for (const migrateToLatestVersion of [false, true]) {
        it(`${scenario.name}, migration requested: ${migrateToLatestVersion}`, async () => {
          const storedTypebot = createLegacyTypebot(version, scenario);
          const snapshot = structuredClone(storedTypebot);
          typebotFindFirst.mockResolvedValue(storedTypebot);

          const result = await handleGetTypebot({
            input: { typebotId: storedTypebot.id, migrateToLatestVersion },
            context: { user: scenario.user },
          });

          expect(result.typebot.version).toBe(
            migrateToLatestVersion ? latestTypebotVersion : version,
          );
          expect(result.typebot.name).toBe(storedTypebot.name);
          expect(storedTypebot).toEqual(snapshot);
          if (migrateToLatestVersion) {
            expect(typebotV6Schema.safeParse(result.typebot).success).toBe(
              true,
            );
            expect(result.typebot.events).toEqual([
              {
                id: "start-group",
                type: "start",
                graphCoordinates: { x: 0, y: 0 },
              },
            ]);
          }
          if (migrateToLatestVersion && scenario.canWrite) {
            expect(typebotUpdate).toHaveBeenCalledTimes(1);
            expect(typebotUpdate).toHaveBeenCalledWith({
              where: { id: storedTypebot.id },
              data: expect.objectContaining({
                version: latestTypebotVersion,
                events: result.typebot.events,
                groups: result.typebot.groups,
              }),
            });
          } else {
            expect(typebotUpdate).not.toHaveBeenCalled();
          }
        });
      }
    }
  });
}

for (const restriction of ["isSuspended", "isPastDue"]) {
  it(`does not persist migration in a publicly shared ${restriction} workspace`, async () => {
    const storedTypebot = createLegacyTypebot("5", {
      publicShare: true,
      role: WorkspaceRole.ADMIN,
      collaboration: CollaborationType.WRITE,
    });
    typebotFindFirst.mockResolvedValue({
      ...storedTypebot,
      workspace: { ...storedTypebot.workspace, [restriction]: true },
    });
    const result = await handleGetTypebot({
      input: { typebotId: storedTypebot.id, migrateToLatestVersion: true },
      context: { user },
    });
    expect(result.typebot.version).toBe(latestTypebotVersion);
    expect(typebotUpdate).not.toHaveBeenCalled();
  });
}

it("does not write an already migrated bot on subsequent reads", async () => {
  typebotFindFirst.mockResolvedValue(
    createLegacyTypebot("5", { publicShare: false, role: WorkspaceRole.ADMIN }),
  );
  const request = {
    input: { typebotId: "typebot-id", migrateToLatestVersion: true },
    context: { user },
  };
  const result = await handleGetTypebot(request);
  expect(typebotUpdate).toHaveBeenCalledTimes(1);
  typebotFindFirst.mockResolvedValue({
    ...createLegacyTypebot("5", {
      publicShare: false,
      role: WorkspaceRole.ADMIN,
    }),
    ...result.typebot,
  });
  typebotUpdate.mockClear();
  expect((await handleGetTypebot(request)).typebot).toEqual(result.typebot);
  expect(typebotUpdate).not.toHaveBeenCalled();
});

it("rejects anonymous access to a private legacy bot without writing", async () => {
  typebotFindFirst.mockResolvedValue(
    createLegacyTypebot("5", { publicShare: false }),
  );
  await expect(
    handleGetTypebot({
      input: { typebotId: "typebot-id", migrateToLatestVersion: true },
      context: { user: null },
    }),
  ).rejects.toMatchObject({ code: "NOT_FOUND" });
  expect(typebotUpdate).not.toHaveBeenCalled();
});

function createLegacyTypebot(
  version: string,
  access: {
    publicShare: boolean;
    collaboration?: CollaborationType;
    role?: WorkspaceRole;
  },
) {
  return {
    id: "typebot-id",
    version,
    name: "Legacy bot",
    events: null,
    groups: [
      {
        id: "start-group",
        title: "Start",
        graphCoordinates: { x: 0, y: 0 },
        blocks: [{ id: "start-block", type: "start", label: "Start" }],
      },
    ],
    edges: [],
    variables: [],
    theme: {},
    settings: { publicShare: { isEnabled: access.publicShare } },
    selectedThemeTemplateId: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    icon: null,
    folderId: null,
    publicId: null,
    customDomain: null,
    workspaceId: "workspace-id",
    resultsTablePreferences: null,
    isArchived: false,
    isClosed: false,
    whatsAppCredentialsId: null,
    riskLevel: null,
    spaceId: null,
    collaborators: access.collaboration
      ? [{ userId: user.id, type: access.collaboration }]
      : [],
    workspace: {
      isSuspended: false,
      isPastDue: false,
      members: access.role ? [{ userId: user.id, role: access.role }] : [],
    },
  };
}

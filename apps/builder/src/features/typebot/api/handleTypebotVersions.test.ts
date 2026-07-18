import { beforeEach, describe, expect, it, mock } from "bun:test";

const typebotFindFirst = mock();
const typebotVersionFindMany = mock();
const typebotVersionFindFirst = mock();
const publicTypebotDeleteMany = mock();
const prismaTransaction = mock();
const isReadTypebotForbidden = mock();
const isWriteTypebotForbidden = mock();
const trackEvents = mock();

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";
delete process.env.ADMIN_EMAIL;

mock.module("@typebot.io/prisma", () => ({
  default: {
    typebot: {
      findFirst: typebotFindFirst,
    },
    typebotVersion: {
      findMany: typebotVersionFindMany,
      findFirst: typebotVersionFindFirst,
    },
    publicTypebot: {
      deleteMany: publicTypebotDeleteMany,
    },
    $transaction: prismaTransaction,
  },
}));

mock.module("@typebot.io/typebot/helpers/isReadTypebotForbidden", () => ({
  isReadTypebotForbidden,
}));

mock.module("@/features/typebot/helpers/isWriteTypebotForbidden", () => ({
  isWriteTypebotForbidden,
}));

mock.module("@/features/typebot/helpers/publishTypebotSnapshot", () => ({
  createAndActivateTypebotVersion: mock(),
  activateTypebotVersion: mock(),
}));

mock.module("@typebot.io/telemetry/trackEvents", () => ({ trackEvents }));

const { handleListTypebotVersions } = await import(
  "./handleListTypebotVersions"
);
const { handleGetTypebotVersion } = await import("./handleGetTypebotVersion");
const { handleUnpublishTypebot } = await import("./handleUnpublishTypebot");
const { handlePublishTypebotVersion } = await import(
  "./handlePublishTypebotVersion"
);

const writableTypebot = {
  id: "typebot-id",
  publishedTypebot: { id: "public-typebot-id" },
  collaborators: [],
  workspace: {
    isSuspended: false,
    isPastDue: false,
    members: [{ userId: "user-id", role: "ADMIN" }],
  },
};

describe("typebot versions handlers", () => {
  beforeEach(() => {
    typebotFindFirst.mockReset();
    typebotVersionFindMany.mockReset();
    typebotVersionFindFirst.mockReset();
    publicTypebotDeleteMany.mockReset();
    prismaTransaction.mockReset();
    isReadTypebotForbidden.mockReset();

    typebotFindFirst.mockResolvedValue(writableTypebot);
    publicTypebotDeleteMany.mockResolvedValue({ count: 1 });
    isReadTypebotForbidden.mockResolvedValue(false);
    isWriteTypebotForbidden.mockResolvedValue(false);
    trackEvents.mockReset();
  });

  it("lists versions without requiring an active public deployment", async () => {
    typebotFindFirst.mockResolvedValue({
      ...writableTypebot,
      publishedTypebot: null,
    });
    typebotVersionFindMany.mockResolvedValue([
      {
        id: "version-2",
        typebotId: "typebot-id",
        versionNumber: 2,
        version: "6.1",
        createdAt: new Date("2026-07-18T10:00:00.000Z"),
        createdById: "user-id",
      },
      {
        id: "version-1",
        typebotId: "typebot-id",
        versionNumber: 1,
        version: "6.1",
        createdAt: new Date("2026-07-18T09:00:00.000Z"),
        createdById: "user-id",
      },
    ]);

    await expect(
      handleListTypebotVersions({
        input: { typebotId: "typebot-id" },
        context: { user: { id: "user-id", email: "user@example.com" } },
      }),
    ).resolves.toEqual({
      versions: [
        {
          id: "version-2",
          typebotId: "typebot-id",
          versionNumber: 2,
          version: "6.1",
          createdAt: new Date("2026-07-18T10:00:00.000Z"),
          createdById: "user-id",
          isActive: false,
        },
        {
          id: "version-1",
          typebotId: "typebot-id",
          versionNumber: 1,
          version: "6.1",
          createdAt: new Date("2026-07-18T09:00:00.000Z"),
          createdById: "user-id",
          isActive: false,
        },
      ],
    });
  });

  it("returns a single immutable version snapshot", async () => {
    typebotVersionFindFirst.mockResolvedValue({
      id: "version-1",
      typebotId: "typebot-id",
      versionNumber: 1,
      version: "6.1",
      createdAt: new Date("2026-07-18T09:00:00.000Z"),
      createdById: "user-id",
      groups: [],
      events: [
        {
          id: "event-1",
          type: "start",
          graphCoordinates: { x: 0, y: 0 },
        },
      ],
      edges: [],
      variables: [],
      settings: {},
      theme: {},
    });

    const result = await handleGetTypebotVersion({
      input: { typebotId: "typebot-id", versionNumber: 1 },
      context: { user: { id: "user-id", email: "user@example.com" } },
    });

    expect(result.version.versionNumber).toBe(1);
    expect(result.version.groups).toEqual([]);
  });

  it("unpublishes active public deployment while preserving version history", async () => {
    await expect(
      handleUnpublishTypebot({
        input: { typebotId: "typebot-id" },
        context: { user: { id: "user-id" } },
      }),
    ).resolves.toEqual({ message: "success" });

    expect(publicTypebotDeleteMany).toHaveBeenCalledWith({
      where: {
        id: "public-typebot-id",
      },
    });
  });

  it("publishes a typebot version and sends telemetry", async () => {
    typebotVersionFindFirst.mockResolvedValue({
      id: "version-1",
      typebotId: "typebot-id",
      versionNumber: 1,
      version: "6.1",
      createdAt: new Date("2026-07-18T09:00:00.000Z"),
      createdById: "user-id",
      groups: [],
      events: [
        {
          id: "event-1",
          type: "start",
          graphCoordinates: { x: 0, y: 0 },
        },
      ],
      edges: [],
      variables: [],
      settings: {},
      theme: {},
    });

    await expect(
      handlePublishTypebotVersion({
        input: { typebotId: "typebot-id", versionNumber: 1 },
        context: { user: { id: "user-id" } },
      }),
    ).resolves.toEqual({ message: "success" });

    expect(trackEvents).toHaveBeenCalledWith([
      {
        name: "Typebot version restored",
        workspaceId: writableTypebot.workspaceId,
        typebotId: writableTypebot.id,
        userId: "user-id",
        data: {
          versionNumber: 1,
        },
      },
    ]);
  });
});

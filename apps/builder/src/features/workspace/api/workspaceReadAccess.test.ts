import { beforeEach, describe, expect, it, mock } from "bun:test";
import { call } from "@orpc/server";
import { WorkspaceRole } from "@typebot.io/prisma/enum";

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";
process.env.ADMIN_EMAIL = "admin@example.com";
process.env.STRIPE_SECRET_KEY = "sk_test_local";
process.env.META_SYSTEM_USER_TOKEN = "local-test-token";

// SKIP_ENV_CHECK bypasses env transformations, including the ADMIN_EMAIL array.
mock.module("@typebot.io/env", () => ({
  env: { ...process.env, ADMIN_EMAIL: ["admin@example.com"] },
}));

const workspaceFindFirst = mock();
const workspaceFindMany = mock();
const workspaceUpdateMany = mock();
const typebotFindFirst = mock();
const resultCount = mock();
const userCredentialsFindMany = mock();
const getGoogleSpreadsheet = mock();
const decrypt = mock();
const decryptAndRefreshCredentialsData = mock();
const downloadMedia = mock();
const fetchItems = mock();

mock.module("@typebot.io/prisma", () => ({
  default: {
    workspace: {
      findFirst: workspaceFindFirst,
      findMany: workspaceFindMany,
      updateMany: workspaceUpdateMany,
    },
    typebot: { findFirst: typebotFindFirst },
    result: { count: resultCount },
    userCredentials: { findMany: userCredentialsFindMany },
  },
}));
mock.module("@typebot.io/credentials/getGoogleSpreadsheet", () => ({
  getGoogleSpreadsheet,
}));
mock.module("@typebot.io/credentials/decrypt", () => ({ decrypt }));
mock.module("@typebot.io/credentials/decryptAndRefreshCredentials", () => ({
  decryptAndRefreshCredentialsData,
}));
mock.module("@typebot.io/whatsapp/downloadMedia", () => ({ downloadMedia }));
mock.module("@typebot.io/forge-repository/definitions", () => ({
  forgedBlocks: { openai: {} },
}));
mock.module("@typebot.io/forge-repository/handlers", () => ({
  forgedBlockHandlers: {
    openai: [{ type: "fetcher", id: "test", fetch: fetchItems }],
  },
}));

const { isReadWorkspaceFobidden: packageHelper } = await import(
  "@typebot.io/workspaces/isReadWorkspaceFobidden"
);
const { isReadWorkspaceFobidden: builderHelper } = await import(
  "../helpers/isReadWorkspaceFobidden"
);
const { handleGetWorkspace, inAppWorkspaceSchema } = await import(
  "./handleGetWorkspace"
);
const { handleListWorkspaces } = await import("./handleListWorkspaces");
const { handleListMembersInWorkspace } = await import(
  "./handleListMembersInWorkspace"
);
const { handleListInvitationsInWorkspace } = await import(
  "./handleListInvitationsInWorkspace"
);
const { handleListCredentials } = await import(
  "../../credentials/api/handleListCredentials"
);
const { handleListCustomDomains } = await import(
  "../../customDomains/api/handleListCustomDomains"
);
const { handleGetUsage } = await import(
  "@typebot.io/billing/api/handleGetUsage"
);
const { handleGetSubscription } = await import(
  "@typebot.io/billing/api/handleGetSubscription"
);
const { handleGetSheets } = await import(
  "../../blocks/integrations/googleSheets/api/handleGetSheets"
);
const { handleGetSpreadsheetName } = await import(
  "../../blocks/integrations/googleSheets/api/handleGetSpreadsheetName"
);
const { fetchSelectItems } = await import("../../forge/api/fetchSelectItems");
const { handleGetWhatsAppMedia } = await import(
  "@typebot.io/whatsapp/api/handleGetWhatsAppMedia"
);
const { handleGetWhatsAppMediaPreview } = await import(
  "@typebot.io/whatsapp/api/handleGetWhatsAppMediaPreview"
);

const user = { id: "guest-id", email: "guest@example.com" };
const context = { user };
const input = { workspaceId: "workspace-id" };
const sheetsInput = {
  ...input,
  credentialsId: "credential-id",
  spreadsheetId: "sheet-id",
};
const workspace = {
  id: input.workspaceId,
  name: "Shared workspace",
  icon: null,
  plan: "FREE",
  isSuspended: false,
  isPastDue: false,
  isVerified: true,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  lastActivityAt: new Date(0),
  stripeId: "cus_private",
  settings: {},
  customChatsLimit: 1234,
  customSeatsLimit: 12,
  chatsHardLimit: 4321,
  members: [{ userId: user.id, role: WorkspaceRole.GUEST }],
  invitations: [{ email: "private@example.com" }],
  credentials: [
    {
      id: "credential-id",
      type: "openai",
      name: "Private credential",
      data: "encrypted",
      iv: "iv",
    },
  ],
  customDomains: [{ name: "private.example.com", createdAt: new Date(0) }],
  typebots: [{ id: "unshared-bot-id" }],
};

beforeEach(() => {
  for (const fn of [
    workspaceFindFirst,
    workspaceFindMany,
    workspaceUpdateMany,
    typebotFindFirst,
    resultCount,
    userCredentialsFindMany,
    getGoogleSpreadsheet,
    decrypt,
    decryptAndRefreshCredentialsData,
    downloadMedia,
    fetchItems,
  ])
    fn.mockReset();
  workspaceFindFirst.mockResolvedValue(workspace);
  resultCount.mockResolvedValue(7);
  getGoogleSpreadsheet.mockResolvedValue({
    type: "success",
    spreadsheet: { title: "Test sheet", loadInfo: mock(), sheetCount: 0 },
  });
  decryptAndRefreshCredentialsData.mockResolvedValue({});
  fetchItems.mockResolvedValue({ data: [{ label: "Test", value: "test" }] });
});

describe.each([
  ["package", packageHelper],
  ["builder", builderHelper],
])("%s workspace read helper", (_name, helper) => {
  it("rejects guests, outsiders and absent roles, even when another user is admin", () => {
    expect(helper(workspace, user)).toBe(true);
    expect(
      helper(
        { members: [{ userId: "another-user", role: WorkspaceRole.ADMIN }] },
        user,
      ),
    ).toBe(true);
    // Runtime callers with incomplete projections must fail closed.
    // @ts-expect-error role is intentionally missing
    expect(helper({ members: [{ userId: user.id }] }, user)).toBe(true);
  });
  it.each([
    WorkspaceRole.ADMIN,
    WorkspaceRole.MEMBER,
  ])("preserves %s access", (role) => {
    expect(helper({ members: [{ userId: user.id, role }] }, user)).toBe(false);
  });
  it("preserves instance administrator access", () => {
    expect(
      helper({ members: [] }, { id: "admin-id", email: "admin@example.com" }),
    ).toBe(false);
  });
});

const workspaceReads = [
  {
    name: "members",
    read: () => handleListMembersInWorkspace({ input, context }),
  },
  {
    name: "invitations",
    read: () => handleListInvitationsInWorkspace({ input, context }),
  },
  {
    name: "credentials",
    read: () =>
      handleListCredentials({
        input: { ...input, scope: "workspace" },
        context,
      }),
  },
  { name: "domains", read: () => handleListCustomDomains({ input, context }) },
  { name: "usage", read: () => handleGetUsage({ input, context }) },
  {
    name: "subscription",
    read: () => handleGetSubscription({ input, context }),
  },
  {
    name: "sheets",
    read: () => handleGetSheets({ input: sheetsInput, context }),
  },
  {
    name: "spreadsheet name",
    read: () => handleGetSpreadsheetName({ input: sheetsInput, context }),
  },
  {
    name: "Forge fetcher",
    read: () =>
      call(
        fetchSelectItems,
        {
          ...input,
          scope: "workspace",
          integrationId: "openai",
          fetcherId: "test",
          options: { credentialsId: "credential-id" },
        },
        {
          context: {
            authenticate: mock(async () => ({
              ...user,
              groupTitlesAutoGeneration: null,
            })),
          },
        },
      ),
  },
];

describe.each(workspaceReads)("$name workspace read", ({ read }) => {
  it("denies guests before downstream data access", async () => {
    await expect(read()).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(resultCount).not.toHaveBeenCalled();
    expect(getGoogleSpreadsheet).not.toHaveBeenCalled();
    expect(decryptAndRefreshCredentialsData).not.toHaveBeenCalled();
    expect(fetchItems).not.toHaveBeenCalled();
  });
  it("denies outsiders", async () => {
    workspaceFindFirst.mockResolvedValue({
      ...workspace,
      members: [{ userId: "other-id", role: WorkspaceRole.ADMIN }],
    });
    await expect(read()).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
  it.each([
    WorkspaceRole.MEMBER,
    WorkspaceRole.ADMIN,
  ])("preserves %s access and selects roles", async (role) => {
    workspaceFindFirst.mockResolvedValue({
      ...workspace,
      stripeId: null,
      members: [{ userId: user.id, role }],
    });
    await expect(read()).resolves.toBeDefined();
    const query = workspaceFindFirst.mock.calls[0]?.[0];
    const members = query?.select?.members ?? query?.include?.members;
    if (members !== true && !members?.include)
      expect(members?.select).toMatchObject({ userId: true, role: true });
  });
});

describe("guest workspace context", () => {
  it("returns exactly the navigation and availability fields and serializes them", async () => {
    const result = await handleGetWorkspace({ input, context });
    expect(result).toEqual({
      currentUserMode: "guest",
      workspace: {
        id: workspace.id,
        name: workspace.name,
        icon: null,
        plan: "FREE",
        isSuspended: false,
        isPastDue: false,
        isVerified: true,
      },
    });
    expect(inAppWorkspaceSchema.parse(result.workspace)).toEqual(
      result.workspace,
    );
    expect(workspaceUpdateMany).not.toHaveBeenCalled();
  });
  it("preserves full context and activity updates for members", async () => {
    workspaceFindFirst.mockResolvedValue({
      ...workspace,
      members: [{ userId: user.id, role: WorkspaceRole.MEMBER }],
    });
    const result = await handleGetWorkspace({ input, context });
    expect(result.currentUserMode).toBe("read");
    expect(result.workspace).toMatchObject({
      stripeId: "cus_private",
      customSeatsLimit: 12,
    });
    expect(inAppWorkspaceSchema.parse(result.workspace)).toEqual(
      result.workspace,
    );
    expect(workspaceUpdateMany).toHaveBeenCalledTimes(1);
  });
  it.each([
    null,
    { ...workspace, members: [] },
  ])("does not update activity or return context for an unauthorized workspace", async (record) => {
    workspaceFindFirst.mockResolvedValue(record);
    await expect(handleGetWorkspace({ input, context })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    expect(workspaceUpdateMany).not.toHaveBeenCalled();
  });
  it("retains the minimal workspace selector scoped to the caller", async () => {
    workspaceFindMany.mockResolvedValue([
      { id: workspace.id, name: workspace.name, icon: null, plan: "FREE" },
    ]);
    await expect(handleListWorkspaces({ context })).resolves.toHaveProperty(
      "workspaces.0.id",
      workspace.id,
    );
    expect(workspaceFindMany).toHaveBeenCalledWith({
      where: { members: { some: { userId: user.id } } },
      select: { name: true, id: true, icon: true, plan: true },
    });
  });
  it("retains access to the guest's own credentials", async () => {
    userCredentialsFindMany.mockResolvedValue([]);
    await expect(
      handleListCredentials({ input: { scope: "user" }, context }),
    ).resolves.toEqual({ credentials: [] });
    expect(workspaceFindFirst).not.toHaveBeenCalled();
    expect(userCredentialsFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: user.id, type: undefined } }),
    );
  });
});

describe.each([
  ["media", handleGetWhatsAppMedia],
  ["preview", handleGetWhatsAppMediaPreview],
])("WhatsApp %s", (_name, handle) => {
  const mediaInput = { typebotId: "shared-bot-id", mediaId: "media-id.png" };
  beforeEach(() => {
    typebotFindFirst.mockResolvedValue({
      whatsAppCredentialsId: "credential-id",
      collaborators: [],
      workspace,
    });
    decrypt.mockResolvedValue({
      provider: "meta",
      systemUserAccessToken: "test",
      phoneNumberId: "test",
    });
    downloadMedia.mockResolvedValue({
      file: new Uint8Array([1, 2]),
      mimeType: "image/png",
    });
  });
  it("denies a guest on an unshared bot before decrypting or downloading", async () => {
    await expect(handle({ input: mediaInput, context })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    expect(decrypt).not.toHaveBeenCalled();
    expect(downloadMedia).not.toHaveBeenCalled();
  });
  it.each([
    "READ",
    "WRITE",
  ])("preserves an explicitly shared bot (%s)", async (type) => {
    typebotFindFirst.mockResolvedValue({
      whatsAppCredentialsId: "credential-id",
      collaborators: [{ userId: user.id, type }],
      workspace,
    });
    const response = await handle({ input: mediaInput, context });
    expect(response.body.size).toBe(2);
    expect(downloadMedia).toHaveBeenCalledTimes(1);
    expect(typebotFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mediaInput.typebotId },
        select: expect.objectContaining({
          collaborators: {
            where: { userId: user.id },
            select: { userId: true },
          },
          workspace: {
            select: expect.objectContaining({
              isSuspended: true,
              isPastDue: true,
              members: { select: { userId: true, role: true } },
            }),
          },
        }),
      }),
    );
  });
  it.each([
    WorkspaceRole.MEMBER,
    WorkspaceRole.ADMIN,
  ])("preserves %s access", async (role) => {
    typebotFindFirst.mockResolvedValue({
      whatsAppCredentialsId: "credential-id",
      collaborators: [],
      workspace: { ...workspace, members: [{ userId: user.id, role }] },
    });
    await expect(handle({ input: mediaInput, context })).resolves.toBeDefined();
  });
  it("does not treat public bot sharing as media authorization", async () => {
    typebotFindFirst.mockResolvedValue({
      whatsAppCredentialsId: "credential-id",
      collaborators: [],
      workspace,
    });
    await expect(
      handle({
        input: mediaInput,
        context: { user: { id: "outsider", email: "outsider@example.com" } },
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(typebotFindFirst.mock.calls[0]?.[0].select.settings).toBeUndefined();
  });
});

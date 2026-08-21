import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Plan, WorkspaceRole } from "@typebot.io/prisma/enum";

const gentleRateLimit = mock();
const sendWorkspaceMemberInvitationEmail = mock();

const members: { userId: string; role: WorkspaceRole }[] = [];
const invitations: { email: string; type: WorkspaceRole }[] = [];
const existingUsers = new Map<
  string,
  { id: string; email: string; name: string }
>();

let transactionQueue = Promise.resolve();

const workspace = {
  id: "workspace-id",
  name: "Workspace",
  plan: Plan.FREE,
  customSeatsLimit: 2,
};

const memberInWorkspace = {
  count: mock(({ where }: { where: { role: { not: WorkspaceRole } } }) =>
    Promise.resolve(
      members.filter((member) => member.role !== where.role.not).length,
    ),
  ),
  create: mock(
    ({
      data,
    }: {
      data: { userId: string; role: WorkspaceRole; workspaceId: string };
    }) => {
      members.push({ userId: data.userId, role: data.role });
      return Promise.resolve(data);
    },
  ),
};

const workspaceInvitation = {
  count: mock(() => Promise.resolve(invitations.length)),
  create: mock(
    ({
      data,
    }: {
      data: { email: string; type: WorkspaceRole; workspaceId: string };
    }) => {
      const invitation = {
        id: `invitation-${invitations.length + 1}`,
        ...data,
      };
      invitations.push({ email: data.email, type: data.type });
      return Promise.resolve(invitation);
    },
  ),
};

const workspaceUpdate = mock(() => Promise.resolve(workspace));
const transaction = mock(
  (
    callback: (transactionPrisma: {
      memberInWorkspace: typeof memberInWorkspace;
      workspace: { update: typeof workspaceUpdate };
      workspaceInvitation: typeof workspaceInvitation;
    }) => Promise<unknown>,
  ) => {
    const result = transactionQueue.then(() =>
      callback({
        memberInWorkspace,
        workspace: { update: workspaceUpdate },
        workspaceInvitation,
      }),
    );
    transactionQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  },
);

const workspaceFindFirst = mock(() => Promise.resolve(workspace));
const userFindUnique = mock(({ where }: { where: { email: string } }) =>
  Promise.resolve(existingUsers.get(where.email) ?? null),
);

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";

mock.module("@typebot.io/auth/lib/gentleRateLimiter", () => ({
  default: { limit: gentleRateLimit },
}));

mock.module(
  "@typebot.io/emails/transactional/WorkspaceMemberInvitationEmail",
  () => ({ sendWorkspaceMemberInvitationEmail }),
);

mock.module("@typebot.io/prisma", () => ({
  default: {
    $transaction: transaction,
    user: { findUnique: userFindUnique },
    workspace: { findFirst: workspaceFindFirst },
  },
}));

const { handleCreateWorkspaceInvitation } = await import(
  "./handleCreateWorkspaceInvitation"
);

const createInvitation = (email: string) =>
  handleCreateWorkspaceInvitation({
    input: {
      workspaceId: workspace.id,
      email,
      type: WorkspaceRole.MEMBER,
    },
    context: {
      user: { id: "admin-user-id", email: "admin@example.com" },
    },
  });

describe("handleCreateWorkspaceInvitation", () => {
  beforeEach(() => {
    members.splice(0, members.length, {
      userId: "admin-user-id",
      role: WorkspaceRole.ADMIN,
    });
    invitations.splice(0);
    existingUsers.clear();
    transactionQueue = Promise.resolve();

    gentleRateLimit.mockReset();
    sendWorkspaceMemberInvitationEmail.mockReset();
    transaction.mockClear();
    workspaceFindFirst.mockClear();
    workspaceUpdate.mockClear();
    userFindUnique.mockClear();
    memberInWorkspace.count.mockClear();
    memberInWorkspace.create.mockClear();
    workspaceInvitation.count.mockClear();
    workspaceInvitation.create.mockClear();

    gentleRateLimit.mockResolvedValue({ success: true });
    sendWorkspaceMemberInvitationEmail.mockResolvedValue(undefined);
  });

  it("does not exceed the seat limit with concurrent existing-user additions", async () => {
    existingUsers.set("first@example.com", {
      id: "first-user-id",
      email: "first@example.com",
      name: "First user",
    });
    existingUsers.set("second@example.com", {
      id: "second-user-id",
      email: "second@example.com",
      name: "Second user",
    });

    const results = await Promise.allSettled([
      createInvitation("first@example.com"),
      createInvitation("second@example.com"),
    ]);

    expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(
      1,
    );
    expect(results.filter(({ status }) => status === "rejected")).toHaveLength(
      1,
    );
    expect(members).toHaveLength(workspace.customSeatsLimit);
    expect(invitations).toHaveLength(0);
    expect(sendWorkspaceMemberInvitationEmail).toHaveBeenCalledTimes(1);
    expectWorkspaceLocks();
  });

  it("does not exceed the seat limit with concurrent new-user invitations", async () => {
    const results = await Promise.allSettled([
      createInvitation("first@example.com"),
      createInvitation("second@example.com"),
    ]);

    expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(
      1,
    );
    expect(results.filter(({ status }) => status === "rejected")).toHaveLength(
      1,
    );
    expect(members).toHaveLength(1);
    expect(invitations).toHaveLength(1);
    expect(sendWorkspaceMemberInvitationEmail).toHaveBeenCalledTimes(1);
    expectWorkspaceLocks();
  });
});

const expectWorkspaceLocks = () => {
  expect(transaction).toHaveBeenCalledTimes(2);
  expect(workspaceUpdate).toHaveBeenCalledTimes(2);
  for (const [input] of workspaceUpdate.mock.calls)
    expect(input).toEqual({
      where: { id: workspace.id },
      data: { id: workspace.id },
    });
};

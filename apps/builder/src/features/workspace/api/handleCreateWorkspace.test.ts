import { beforeEach, describe, expect, it, mock } from "bun:test";

const USER_ID = "free-user-id";
const CONCURRENT_REQUEST_COUNT = 8;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type StoredWorkspace = {
  id: string;
  name: string;
  icon?: string;
  plan: string;
  members: {
    userId: string;
    role: string;
    createdAt: Date;
  }[];
};

type WorkspaceCreateArguments = {
  data: {
    name: string;
    icon?: string;
    plan: string;
    members: {
      create: {
        userId: string;
        role: string;
      }[];
    };
  };
};

const storedWorkspaces: StoredWorkspace[] = [];
const trackEvents = mock();
let userLockTail = Promise.resolve();
let workspaceSequence = 0;

const workspaceFindMany = mock(async (query: unknown) => {
  const workspacesSnapshot = [...storedWorkspaces];

  if (isFreeTierLimitQuery(query))
    return workspacesSnapshot
      .filter(
        (workspace) =>
          workspace.plan === "FREE" &&
          workspace.members.some(
            (member) => member.userId === USER_ID && member.role === "ADMIN",
          ),
      )
      .map((workspace) => ({
        members: workspace.members
          .filter(
            (member) => member.userId === USER_ID && member.role === "ADMIN",
          )
          .slice(0, 1)
          .map((member) => ({ createdAt: member.createdAt })),
      }));

  return workspacesSnapshot
    .filter((workspace) =>
      workspace.members.some((member) => member.userId === USER_ID),
    )
    .map((workspace) => ({ name: workspace.name }));
});

const workspaceCreate = mock(async ({ data }: WorkspaceCreateArguments) => {
  workspaceSequence += 1;

  const workspace = {
    id: `created-workspace-${workspaceSequence}`,
    name: data.name,
    icon: data.icon,
    plan: data.plan,
    settings: null,
    members: data.members.create.map((member) => ({
      ...member,
      createdAt: new Date(),
    })),
  };

  storedWorkspaces.push(workspace);
  return workspace;
});

const transaction = mock(
  async (
    callback: (database: {
      $queryRaw: (...query: unknown[]) => Promise<void>;
      workspace: {
        create: typeof workspaceCreate;
        findMany: typeof workspaceFindMany;
      };
    }) => Promise<unknown>,
  ) => {
    let releaseUserLock = () => {};

    try {
      return await callback({
        $queryRaw: async () => {
          const precedingUserLock = userLockTail;
          userLockTail = new Promise<void>((resolve) => {
            releaseUserLock = resolve;
          });
          await precedingUserLock;
        },
        workspace: {
          create: workspaceCreate,
          findMany: workspaceFindMany,
        },
      });
    } finally {
      releaseUserLock();
    }
  },
);

process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/typebot";

mock.module("@typebot.io/prisma", () => ({
  default: {
    $transaction: transaction,
    workspace: {
      create: workspaceCreate,
      findMany: workspaceFindMany,
    },
  },
}));

mock.module("@typebot.io/telemetry/trackEvents", () => ({ trackEvents }));

mock.module("@typebot.io/workspaces/parseWorkspaceDefaultPlan", () => ({
  parseWorkspaceDefaultPlan: () => "FREE",
}));

const { handleCreateWorkspace } = await import("./handleCreateWorkspace");

describe("handleCreateWorkspace free-tier concurrency limits", () => {
  beforeEach(() => {
    storedWorkspaces.length = 0;
    userLockTail = Promise.resolve();
    workspaceSequence = 0;
    trackEvents.mockReset();
    trackEvents.mockResolvedValue(undefined);
    transaction.mockClear();
    workspaceFindMany.mockClear();
    workspaceCreate.mockClear();
  });

  it("allows only one concurrent creation at the free workspace count boundary", async () => {
    seedFreeWorkspace(new Date(Date.now() - ONE_DAY_MS - 1));

    const results = await createWorkspacesConcurrently();

    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(rejectionCodes(results)).toEqual(
      Array(CONCURRENT_REQUEST_COUNT - 1).fill("FORBIDDEN"),
    );
    expect(storedWorkspaces).toHaveLength(2);
    expect(workspaceCreate).toHaveBeenCalledTimes(1);
    expect(trackEvents).toHaveBeenCalledTimes(1);
  });

  it("allows only one concurrent creation before starting the cooldown", async () => {
    const results = await createWorkspacesConcurrently();

    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(rejectionCodes(results)).toEqual(
      Array(CONCURRENT_REQUEST_COUNT - 1).fill("TOO_MANY_REQUESTS"),
    );
    expect(storedWorkspaces).toHaveLength(1);
    expect(workspaceCreate).toHaveBeenCalledTimes(1);
    expect(trackEvents).toHaveBeenCalledTimes(1);
  });
});

const seedFreeWorkspace = (membershipCreatedAt: Date) => {
  storedWorkspaces.push({
    id: "existing-free-workspace",
    name: "Existing workspace",
    plan: "FREE",
    members: [
      {
        userId: USER_ID,
        role: "ADMIN",
        createdAt: membershipCreatedAt,
      },
    ],
  });
};

const createWorkspacesConcurrently = () =>
  Promise.allSettled(
    Array.from({ length: CONCURRENT_REQUEST_COUNT }, (_, index) =>
      handleCreateWorkspace({
        input: { name: `Workspace ${index}` },
        context: {
          user: { id: USER_ID, email: "free-user@example.com" },
        },
      }),
    ),
  );

const rejectionCodes = (
  results: PromiseSettledResult<
    Awaited<ReturnType<typeof handleCreateWorkspace>>
  >[],
) =>
  results.flatMap((result) => {
    if (
      result.status !== "rejected" ||
      typeof result.reason !== "object" ||
      result.reason === null ||
      !("code" in result.reason)
    )
      return [];

    return [result.reason.code];
  });

const isFreeTierLimitQuery = (query: unknown) => {
  if (typeof query !== "object" || query === null || !("select" in query))
    return false;

  const select = query.select;
  return typeof select === "object" && select !== null && "members" in select;
};

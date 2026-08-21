import { describe, expect, it, mock } from "bun:test";
import {
  type DestroyUserDependencies,
  destroyUserWithDependencies,
  type WorkspaceToDestroy,
} from "./destroyUserWithDependencies";

describe("destroyUser", () => {
  it("does not mutate anything when confirmation is denied", async () => {
    const { dependencies, mutations } = createDependencies({
      confirmations: [false],
      user: { id: "user-1" },
    });

    await destroyUserWithDependencies("user@example.com", dependencies);

    expect(dependencies.confirm).toHaveBeenCalledTimes(1);
    expect(mutations).toEqual([]);
  });

  it("deletes results in batches, then database and S3 records", async () => {
    const resultIds = Array.from(
      { length: 1_001 },
      (_, index) => `result-${index}`,
    );
    const { dependencies, mutations } = createDependencies({
      confirmations: [true, true],
      workspaces: [
        {
          id: "workspace-1",
          members: [{ user: { email: "user@example.com" } }],
          name: "Workspace",
          plan: "FREE",
          stripeId: null,
          typebots: [{ results: resultIds.map((id) => ({ id })) }],
        },
      ],
    });

    await destroyUserWithDependencies("user@example.com", dependencies);

    expect(dependencies.deleteResults).toHaveBeenCalledTimes(2);
    expect(dependencies.deleteResults).toHaveBeenNthCalledWith(
      1,
      resultIds.slice(0, 1_000),
    );
    expect(dependencies.deleteResults).toHaveBeenNthCalledWith(
      2,
      resultIds.slice(1_000),
    );
    expect(mutations).toEqual([
      "delete-results:1000",
      "delete-results:1",
      "delete-workspace:workspace-1",
      "remove-workspace-objects:workspace-1",
      "delete-user-email:user@example.com",
      "remove-user-objects:user-1",
    ]);
  });

  it("aborts before confirmation when another workspace member is found", async () => {
    const { dependencies, mutations, workspacesIssueWrites } =
      createDependencies({
        confirmations: [true],
        workspaces: [
          {
            id: "workspace-1",
            members: [
              { user: { email: "user@example.com" } },
              { user: { email: "other@example.com" } },
            ],
            name: "Shared workspace",
            plan: "PRO",
            stripeId: "customer-1",
            typebots: [],
          },
        ],
      });

    await destroyUserWithDependencies("user@example.com", dependencies);

    expect(dependencies.confirm).not.toHaveBeenCalled();
    expect(mutations).toEqual([]);
    expect(workspacesIssueWrites).toHaveLength(1);
  });
});

const createDependencies = ({
  confirmations = [],
  user = null,
  workspaces = [],
}: {
  confirmations?: boolean[];
  user?: { id: string } | null;
  workspaces?: WorkspaceToDestroy[];
}) => {
  const mutations: string[] = [];
  const workspacesIssueWrites: string[] = [];

  const dependencies: DestroyUserDependencies = {
    confirm: mock(async () => confirmations.shift() ?? false),
    deleteResults: mock(async (ids) => {
      mutations.push(`delete-results:${ids.length}`);
      return { count: ids.length };
    }),
    deleteUserByEmail: mock(async (email) => {
      mutations.push(`delete-user-email:${email}`);
      return { id: "user-1" };
    }),
    deleteUserById: mock(async (id) => {
      mutations.push(`delete-user-id:${id}`);
    }),
    deleteWorkspace: mock(async (id) => {
      mutations.push(`delete-workspace:${id}`);
    }),
    findUser: mock(async () => user),
    findWorkspaces: mock(async () => workspaces),
    removeObjectsFromUser: mock(async (id) => {
      mutations.push(`remove-user-objects:${id}`);
    }),
    removeObjectsFromWorkspace: mock(async (id) => {
      mutations.push(`remove-workspace-objects:${id}`);
    }),
    writeWorkspacesIssue: mock((contents) => {
      workspacesIssueWrites.push(contents);
    }),
  };

  return { dependencies, mutations, workspacesIssueWrites };
};

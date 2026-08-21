export const destroyUserWithDependencies = async (
  email: string,
  dependencies: DestroyUserDependencies,
) => {
  const workspaces = await dependencies.findWorkspaces(email);

  if (workspaces.length === 0) {
    console.log("No workspaces found");
    const user = await dependencies.findUser(email);
    if (user) {
      console.log(`User found: ${user.id}`);
      const proceed = await dependencies.confirm("Remove user?");
      if (!proceed) {
        console.log("Aborting");
        return;
      }
      await dependencies.deleteUserById(user.id);
      await dependencies.removeObjectsFromUser(user.id);
      console.log("User deleted.", JSON.stringify(user, null, 2));
    }
    return;
  }

  console.log(`Found ${workspaces.length} workspaces`);

  if (
    workspaces.some((workspace) =>
      workspace.members.some(
        (member) => member.user.email && member.user.email !== email,
      ),
    )
  ) {
    console.log(
      "Some workspaces have other members. Something is wrong. Logging and exiting...",
    );
    dependencies.writeWorkspacesIssue(JSON.stringify(workspaces, null, 2));
    return;
  }

  console.log(
    "Workspaces:",
    JSON.stringify(
      workspaces.map((workspace) => ({
        id: workspace.id,
        plan: workspace.plan,
        members: workspace.members,
        stripeId: workspace.stripeId,
      })),
      null,
      2,
    ),
  );

  if (!(await dependencies.confirm("Proceed?"))) {
    console.log("Aborting");
    return;
  }

  for (const workspace of workspaces) {
    const totalResults = workspace.typebots.reduce(
      (total, typebot) => total + typebot.results.length,
      0,
    );

    if (totalResults > 0) {
      console.log(
        `Workspace ${workspace.name} has ${totalResults} results. We should delete them first...`,
      );
      if (!(await dependencies.confirm("Proceed?"))) {
        console.log("Aborting");
        return;
      }
    }
    for (const typebot of workspace.typebots.filter(
      (typebot) => typebot.results.length > 0,
    )) {
      await deleteTypebotResultsInBatches(
        typebot.results.map((result) => result.id),
        dependencies,
      );
    }
    await dependencies.deleteWorkspace(workspace.id);
    await dependencies.removeObjectsFromWorkspace(workspace.id);
  }

  const user = await dependencies.deleteUserByEmail(email);
  await dependencies.removeObjectsFromUser(user.id);

  console.log("User deleted.", JSON.stringify(user, null, 2));
};

const deleteTypebotResultsInBatches = async (
  resultIds: readonly string[],
  dependencies: DestroyUserDependencies,
) => {
  const BATCH_SIZE = 1_000;
  let deletedCount = 0;

  for (let index = 0; index < resultIds.length; index += BATCH_SIZE) {
    const batchIds = resultIds.slice(index, index + BATCH_SIZE);
    const { count } = await dependencies.deleteResults(batchIds);
    deletedCount += count;

    console.log(`Deleted ${deletedCount}/${resultIds.length} results…`);
  }
};

export type WorkspaceToDestroy = {
  id: string;
  members: readonly {
    user: { email: string | null };
  }[];
  name: string;
  plan: string;
  stripeId: string | null;
  typebots: readonly {
    results: readonly { id: string }[];
  }[];
};

export type DestroyUserDependencies = {
  confirm: (message: string) => Promise<boolean>;
  deleteResults: (ids: readonly string[]) => Promise<{ count: number }>;
  deleteUserByEmail: (email: string) => Promise<{ id: string }>;
  deleteUserById: (id: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  findUser: (email: string) => Promise<{ id: string } | null>;
  findWorkspaces: (email: string) => Promise<readonly WorkspaceToDestroy[]>;
  removeObjectsFromUser: (id: string) => Promise<void>;
  removeObjectsFromWorkspace: (id: string) => Promise<void>;
  writeWorkspacesIssue: (contents: string) => void;
};

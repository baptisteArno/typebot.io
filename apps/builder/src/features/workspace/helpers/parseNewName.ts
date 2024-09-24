import type { Workspace } from "@typebot.io/workspaces/schemas";

export const parseNewName = (
  userFullName: string | undefined,
  existingWorkspaces: Pick<Workspace, "name">[],
) => {
  const workspaceName = userFullName
    ? `${userFullName}'s workspace`
    : "My workspace";
  let newName = workspaceName;
  let i = 1;
  while (existingWorkspaces.find((w) => w.name === newName)) {
    newName = `${workspaceName} (${i})`;
    i++;
  }
  return newName;
};

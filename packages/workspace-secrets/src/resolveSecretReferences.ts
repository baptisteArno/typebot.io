import { workspaceSecretReferenceRegex } from "./constants";
import { extractSecretReferences } from "./extractSecretReferences";
import { getWorkspaceSecretsByNames } from "./getWorkspaceSecretsByNames";

export const resolveSecretReferences = async ({
  input,
  workspaceId,
}: {
  input: string;
  workspaceId: string;
}): Promise<string> => {
  const names = extractSecretReferences(input);
  if (names.length === 0) return input;
  const resolved = await getWorkspaceSecretsByNames({ workspaceId, names });
  return input.replace(workspaceSecretReferenceRegex, (_, name) => {
    const value = resolved.get(name);
    if (value === undefined) return "";
    return value;
  });
};

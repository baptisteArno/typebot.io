import { workspaceSecretReferenceRegex } from "./constants";

export const extractSecretReferences = (input: string): string[] => {
  const names = new Set<string>();
  for (const match of input.matchAll(workspaceSecretReferenceRegex))
    names.add(match[1]);
  return Array.from(names);
};

import type { Variable } from "./schemas";

const variableReferencesRegex = /\{\{([^{}]+)\}\}/g;
const variableIdRegex = /"\w*variableid":"([^"]+)"/gi;

export const extractVariableIdReferencesInObject = <T>(
  obj: T,
  existingVariables: Variable[],
): string[] =>
  [...(JSON.stringify(obj).match(variableReferencesRegex) ?? [])].reduce<
    string[]
  >((acc, match) => {
    const varName = match.slice(2, -2);
    const id = existingVariables.find((v) => v.name === varName)?.id;
    if (!id || acc.find((accId) => accId === id)) return acc;
    return acc.concat(id);
  }, []);

export const extractVariableIdsFromObject = (obj: any): string[] => {
  const stringifiedObj = JSON.stringify(obj);
  const matches = stringifiedObj.matchAll(variableIdRegex);
  const capturedVariables = new Set<string>();
  for (const match of matches) {
    capturedVariables.add(match[1]);
  }
  return Array.from(capturedVariables);
};

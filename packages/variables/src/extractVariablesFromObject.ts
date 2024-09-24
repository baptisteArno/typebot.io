import type { Variable } from "./schemas";

const variableNameRegex = /\{\{([^{}]+)\}\}/g;

export const extractVariableIdReferencesInObject = (
  obj: any,
  existingVariables: Variable[],
): string[] =>
  [...(JSON.stringify(obj).match(variableNameRegex) ?? [])].reduce<string[]>(
    (acc, match) => {
      const varName = match.slice(2, -2);
      const id = existingVariables.find((v) => v.name === varName)?.id;
      if (!id || acc.find((accId) => accId === id)) return acc;
      return acc.concat(id);
    },
    [],
  );

const variableIdRegex = /"\w*variableid":"([^"]+)"/gi;

export const extractVariableIdsFromObject = (obj: any): string[] =>
  [...(JSON.stringify(obj).match(variableIdRegex) ?? [])].reduce<string[]>(
    (acc, match) => {
      const id = variableIdRegex.exec(match)?.[1];
      if (!id || acc.find((accId) => accId === id)) return acc;
      return acc.concat(id);
    },
    [],
  );

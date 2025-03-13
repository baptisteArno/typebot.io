import type { Cell } from "@typebot.io/blocks-integrations/googleSheets/schema";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";

export const parseNewCellValuesObject = (
  cells: Cell[],
  {
    sessionStore,
    variables,
    headerValues,
  }: {
    variables: Variable[];
    sessionStore: SessionStore;
    headerValues?: string[];
  },
): { [key: string]: { value: string; columnIndex: number } } =>
  cells.reduce((row, cell) => {
    return !cell.column || !cell.value
      ? row
      : {
          ...row,
          [cell.column]: {
            value: parseVariables(cell.value, {
              variables,
              sessionStore,
            }),
            columnIndex: headerValues?.findIndex(
              (headerValue) => headerValue === cell.column,
            ),
          },
        };
  }, {});

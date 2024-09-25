import type { Cell } from "@typebot.io/blocks-integrations/googleSheets/schema";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";

export const parseNewCellValuesObject =
  (variables: Variable[]) =>
  (
    cells: Cell[],
    headerValues?: string[],
  ): { [key: string]: { value: string; columnIndex: number } } =>
    cells.reduce((row, cell) => {
      return !cell.column || !cell.value
        ? row
        : {
            ...row,
            [cell.column]: {
              value: parseVariables(variables)(cell.value),
              columnIndex: headerValues?.findIndex(
                (headerValue) => headerValue === cell.column,
              ),
            },
          };
    }, {});

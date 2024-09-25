import type { Cell } from "@typebot.io/blocks-integrations/googleSheets/schema";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";

export const parseNewRowObject =
  (variables: Variable[]) =>
  (cells: Cell[]): { [key: string]: string } =>
    cells.reduce((row, cell) => {
      return !cell.column || !cell.value
        ? row
        : {
            ...row,
            [cell.column]: parseVariables(variables)(cell.value),
          };
    }, {});

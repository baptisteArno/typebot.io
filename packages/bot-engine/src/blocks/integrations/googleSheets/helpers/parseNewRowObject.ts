import type { Cell } from "@typebot.io/blocks-integrations/googleSheets/schema";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";

export const parseNewRowObject = (
  cells: Cell[],
  {
    sessionStore,
    variables,
  }: { variables: Variable[]; sessionStore: SessionStore },
): { [key: string]: string } =>
  cells.reduce<{ [key: string]: string }>((row, cell) => {
    if (!cell.column || !cell.value) return row;
    row[cell.column] = parseVariables(cell.value, {
      variables,
      sessionStore,
    });
    return row;
  }, {});

import { Variable, Cell } from '@typebot.io/schemas'
import { parseVariables } from '@typebot.io/variables/parseVariables'

export const parseNewCellValuesObject =
  (variables: Variable[]) =>
  (
    cells: Cell[],
    headerValues?: string[]
  ): { [key: string]: { value: string; columnIndex: number } } =>
    cells.reduce((row, cell) => {
      return !cell.column || !cell.value
        ? row
        : {
            ...row,
            [cell.column]: {
              value: parseVariables(variables)(cell.value),
              columnIndex: headerValues?.findIndex(
                (headerValue) => headerValue === cell.column
              ),
            },
          }
    }, {})

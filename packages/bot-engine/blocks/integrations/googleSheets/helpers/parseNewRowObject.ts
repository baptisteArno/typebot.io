import { Variable, Cell } from '@typebot.io/schemas'
import { parseVariables } from '@typebot.io/variables/parseVariables'

export const parseNewRowObject =
  (variables: Variable[]) =>
  (cells: Cell[]): { [key: string]: string } =>
    cells.reduce((row, cell) => {
      return !cell.column || !cell.value
        ? row
        : {
            ...row,
            [cell.column]: parseVariables(variables)(cell.value),
          }
    }, {})

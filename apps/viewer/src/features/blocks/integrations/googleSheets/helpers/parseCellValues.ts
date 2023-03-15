import { parseVariables } from '@/features/variables/parseVariables'
import { Variable, Cell } from '@typebot.io/schemas'

export const parseCellValues =
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

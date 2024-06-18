import { Variable, Cell } from '@sniper.io/schemas'
import { parseVariables } from '@sniper.io/variables/parseVariables'

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

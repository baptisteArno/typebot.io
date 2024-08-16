// See `where`: https://docs.nocodb.com/0.109.7/developer-resources/rest-apis/#query-params
// Example: (colName,eq,colValue)~or(colName2,gt,colValue2)

import { isEmpty } from '@typebot.io/lib'

export const convertFilterToWhereClause = (
  filter:
    | {
        comparisons: {
          input?: string
          operator?: string
          value?: string
        }[]
        joiner?: 'AND' | 'OR'
      }
    | undefined
): string | undefined => {
  if (!filter || !filter.comparisons || filter.comparisons.length === 0) return

  const where = filter.comparisons
    .map((comparison) => {
      switch (comparison.operator) {
        case 'Not equal':
          return `(${comparison.input},ne,${comparison.value})`
        case 'Contains':
          return `(${comparison.input},like,%${comparison.value}%)`
        case 'Greater than':
          return `(${comparison.input},gt,${comparison.value})`
        case 'Less than':
          return `(${comparison.input},lt,${comparison.value})`
        case 'Is set':
          return `(${comparison.input},isnot,null)`
        case 'Is empty':
          return `(${comparison.input},is,null)`
        case 'Starts with':
          return `(${comparison.input},like,${comparison.value}%)`
        case 'Ends with':
          return `(${comparison.input},like,%${comparison.value})`
        default:
          return `(${comparison.input},eq,${comparison.value})`
      }
    })
    .filter(Boolean)
    .join('~' + (filter.joiner === 'OR' ? 'or' : 'and'))

  if (isEmpty(where)) return
  return where
}

import { getPrefilledInputValue } from '../../../getPrefilledValue'
import { DateInputBlock, SessionState, Variable } from '@typebot.io/schemas'
import { deepParseVariables } from '@typebot.io/variables/deepParseVariables'
import { parseVariables } from '@typebot.io/variables/parseVariables'

export const parseDateInput =
  (state: SessionState) => (block: DateInputBlock) => {
    const variables = state.typebotsQueue[0].typebot.variables
    if (!block.options) return deepParseVariables(variables)(block)
    return {
      ...block,
      options: {
        ...deepParseVariables(variables)(block.options),
        min: parseDateLimit(
          block.options.min,
          block.options.hasTime,
          variables
        ),
        max: parseDateLimit(
          block.options.max,
          block.options.hasTime,
          variables
        ),
      },
      prefilledValue: getPrefilledInputValue(variables)(block),
    }
  }

const parseDateLimit = (
  limit:
    | NonNullable<DateInputBlock['options']>['min']
    | NonNullable<DateInputBlock['options']>['max'],
  hasTime: NonNullable<DateInputBlock['options']>['hasTime'],
  variables: Variable[]
) => {
  if (!limit) return
  const parsedLimit = parseVariables(variables)(limit)
  const dateIsoNoSecondsRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d/
  const matchDateTime = parsedLimit.match(dateIsoNoSecondsRegex)
  if (matchDateTime)
    return hasTime ? matchDateTime[0] : matchDateTime[0].slice(0, 10)
  return parsedLimit
}

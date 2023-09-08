import { getPrefilledInputValue } from '@/features/chat/helpers/getPrefilledValue'
import { deepParseVariables } from '@/features/variables/deepParseVariable'
import { parseVariables } from '@/features/variables/parseVariables'
import {
  DateInputBlock,
  DateInputOptions,
  SessionState,
  Variable,
} from '@typebot.io/schemas'

export const parseDateInput =
  (state: SessionState) => (block: DateInputBlock) => {
    return {
      ...block,
      options: {
        ...deepParseVariables(state.typebotsQueue[0].typebot.variables)(
          block.options
        ),
        min: parseDateLimit(
          block.options.min,
          block.options.hasTime,
          state.typebotsQueue[0].typebot.variables
        ),
        max: parseDateLimit(
          block.options.max,
          block.options.hasTime,
          state.typebotsQueue[0].typebot.variables
        ),
      },
      prefilledValue: getPrefilledInputValue(
        state.typebotsQueue[0].typebot.variables
      )(block),
    }
  }

const parseDateLimit = (
  limit: DateInputOptions['min'] | DateInputOptions['max'],
  hasTime: DateInputOptions['hasTime'],
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

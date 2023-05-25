import { saveSuccessLog } from '@/features/logs/saveSuccessLog'
import { updateVariables } from '@/features/variables/updateVariables'
import { byId, isDefined } from '@typebot.io/lib'
import { SessionState } from '@typebot.io/schemas'
import { ChatCompletionOpenAIOptions } from '@typebot.io/schemas/features/blocks/integrations/openai'
import { VariableWithUnknowValue } from '@typebot.io/schemas/features/typebot/variable'

export const resumeChatCompletion =
  (
    state: SessionState,
    {
      outgoingEdgeId,
      options,
    }: { outgoingEdgeId?: string; options: ChatCompletionOpenAIOptions }
  ) =>
  async (message: string, totalTokens?: number) => {
    let newSessionState = state
    const newVariables = options.responseMapping.reduce<
      VariableWithUnknowValue[]
    >((newVariables, mapping) => {
      const existingVariable = newSessionState.typebot.variables.find(
        byId(mapping.variableId)
      )
      if (!existingVariable) return newVariables
      if (mapping.valueToExtract === 'Message content') {
        newVariables.push({
          ...existingVariable,
          value: Array.isArray(existingVariable.value)
            ? existingVariable.value.concat(message)
            : message,
        })
      }
      if (mapping.valueToExtract === 'Total tokens' && isDefined(totalTokens)) {
        newVariables.push({
          ...existingVariable,
          value: totalTokens,
        })
      }
      return newVariables
    }, [])
    if (newVariables.length > 0)
      newSessionState = await updateVariables(newSessionState)(newVariables)
    state.result &&
      (await saveSuccessLog({
        resultId: state.result.id,
        message: 'OpenAI block successfully executed',
      }))
    return {
      outgoingEdgeId,
      newSessionState,
    }
  }

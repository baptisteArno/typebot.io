import { byId, isDefined } from '@sniper.io/lib'
import { ContinueChatResponse, SessionState } from '@sniper.io/schemas'
import { ChatCompletionOpenAIOptions } from '@sniper.io/schemas/features/blocks/integrations/openai'
import { VariableWithUnknowValue } from '@sniper.io/schemas/features/sniper/variable'
import { updateVariablesInSession } from '@sniper.io/variables/updateVariablesInSession'

export const resumeChatCompletion =
  (
    state: SessionState,
    {
      outgoingEdgeId,
      options,
      logs = [],
    }: {
      outgoingEdgeId?: string
      options: ChatCompletionOpenAIOptions
      logs?: ContinueChatResponse['logs']
    }
  ) =>
  async (message: string, totalTokens?: number) => {
    let newSessionState = state
    const newVariables = options.responseMapping?.reduce<
      VariableWithUnknowValue[]
    >((newVariables, mapping) => {
      const { sniper } = newSessionState.snipersQueue[0]
      const existingVariable = sniper.variables.find(byId(mapping.variableId))
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
    if (newVariables && newVariables.length > 0)
      newSessionState = updateVariablesInSession({
        newVariables,
        state: newSessionState,
        currentBlockId: undefined,
      }).updatedState
    return {
      outgoingEdgeId,
      newSessionState,
      logs,
    }
  }

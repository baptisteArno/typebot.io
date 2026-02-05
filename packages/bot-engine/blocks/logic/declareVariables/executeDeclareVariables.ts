import { DeclareVariablesBlock, SessionState } from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '../../../types'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'

export const executeDeclareVariables = async (
  state: SessionState,
  block: DeclareVariablesBlock
): Promise<ExecuteLogicResponse> => {
  const variables = block.options?.variables ?? []
  
  if (variables.length === 0) {
    return {
      outgoingEdgeId: block.outgoingEdgeId,
    }
  }

  // Find the first variable that doesn't have a value yet
  for (const declaredVar of variables) {
    const variable = state.typebotsQueue[0].typebot.variables.find(
      (v) => v.id === declaredVar.variableId
    )
    
    if (!variable) continue

    // If the variable already has a value, skip it
    if (variable.value !== undefined && variable.value !== null && variable.value !== '') {
      continue
    }

    // This variable needs input - show a text input for it
    const messages: ExecuteLogicResponse['messages'] = []
    
    // Add description as a bubble if available
    if (declaredVar.description) {
      messages.push({
        id: `${block.id}-desc-${variable.id}`,
        type: BubbleBlockType.TEXT,
        content: {
          type: 'richText',
          richText: [
            {
              type: 'p',
              children: [{ text: declaredVar.description }],
            },
          ],
        },
      })
    }

    // Return a text input for this variable
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      messages,
      input: {
        id: `${block.id}-input-${variable.id}`,
        type: InputBlockType.TEXT,
        outgoingEdgeId: block.outgoingEdgeId,
        options: {
          labels: {
            placeholder: declaredVar.description || `Enter ${variable.name}`,
            button: 'Send',
          },
          variableId: variable.id,
          isLong: false,
        },
        prefilledValue: undefined,
      },
      newSessionState: {
        ...state,
        currentBlockId: block.id,
      },
    }
  }

  // All variables have values, proceed
  return {
    outgoingEdgeId: block.outgoingEdgeId,
  }
}

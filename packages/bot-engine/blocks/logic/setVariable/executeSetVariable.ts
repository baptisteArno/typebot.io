import { SessionState, SetVariableBlock, Variable } from '@typebot.io/schemas'
import { byId } from '@typebot.io/lib'
import { ExecuteLogicResponse } from '../../../types'
import { parseScriptToExecuteClientSideAction } from '../script/executeScript'
import { parseGuessedValueType } from '../../../variables/parseGuessedValueType'
import { parseVariables } from '../../../variables/parseVariables'
import { updateVariablesInSession } from '../../../variables/updateVariablesInSession'
import { createId } from '@paralleldrive/cuid2'

export const executeSetVariable = (
  state: SessionState,
  block: SetVariableBlock
): ExecuteLogicResponse => {
  const { variables } = state.typebotsQueue[0].typebot
  if (!block.options?.variableId)
    return {
      outgoingEdgeId: block.outgoingEdgeId,
    }
  const expressionToEvaluate = getExpressionToEvaluate(state)(block.options)
  const isCustomValue = !block.options.type || block.options.type === 'Custom'
  if (
    expressionToEvaluate &&
    !state.whatsApp &&
    ((isCustomValue && block.options.isExecutedOnClient) ||
      block.options.type === 'Moment of the day')
  ) {
    const scriptToExecute = parseScriptToExecuteClientSideAction(
      variables,
      expressionToEvaluate
    )
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      clientSideActions: [
        {
          setVariable: {
            scriptToExecute,
          },
          expectsDedicatedReply: true,
        },
      ],
    }
  }
  const evaluatedExpression = expressionToEvaluate
    ? evaluateSetVariableExpression(variables)(expressionToEvaluate)
    : undefined
  const existingVariable = variables.find(byId(block.options.variableId))
  if (!existingVariable) return { outgoingEdgeId: block.outgoingEdgeId }
  const newVariable = {
    ...existingVariable,
    value: evaluatedExpression,
  }
  const newSessionState = updateVariablesInSession(state)([newVariable])
  return {
    outgoingEdgeId: block.outgoingEdgeId,
    newSessionState,
  }
}

const evaluateSetVariableExpression =
  (variables: Variable[]) =>
  (str: string): unknown => {
    const isSingleVariable =
      str.startsWith('{{') && str.endsWith('}}') && str.split('{{').length === 2
    if (isSingleVariable) return parseVariables(variables)(str)
    const evaluating = parseVariables(variables, { fieldToParse: 'id' })(
      str.includes('return ') ? str : `return ${str}`
    )
    try {
      const func = Function(...variables.map((v) => v.id), evaluating)
      return func(...variables.map((v) => parseGuessedValueType(v.value)))
    } catch (err) {
      return parseVariables(variables)(str)
    }
  }

const getExpressionToEvaluate =
  (state: SessionState) =>
  (options: SetVariableBlock['options']): string | null => {
    switch (options.type) {
      case 'Contact name':
        return state.whatsApp?.contact.name ?? null
      case 'Phone number': {
        const phoneNumber = state.whatsApp?.contact.phoneNumber
        return phoneNumber ? `"${state.whatsApp?.contact.phoneNumber}"` : null
      }
      case 'Now':
      case 'Today':
        return 'new Date().toISOString()'
      case 'Tomorrow': {
        return 'new Date(Date.now() + 86400000).toISOString()'
      }
      case 'Yesterday': {
        return 'new Date(Date.now() - 86400000).toISOString()'
      }
      case 'Random ID': {
        return `"${createId()}"`
      }
      case 'User ID': {
        return state.typebotsQueue[0].resultId ?? `"${createId()}"`
      }
      case 'Map item with same index': {
        return `const itemIndex = ${options.mapListItemParams?.baseListVariableId}.indexOf(${options.mapListItemParams?.baseItemVariableId})
      return ${options.mapListItemParams?.targetListVariableId}.at(itemIndex)`
      }
      case 'Empty': {
        return null
      }
      case 'Moment of the day': {
        return `const now = new Date()
        if(now.getHours() < 12) return 'morning'
        if(now.getHours() >= 12 && now.getHours() < 18) return 'afternoon'
        if(now.getHours() >= 18) return 'evening'
        if(now.getHours() >= 22 || now.getHours() < 6) return 'night'`
      }
      case 'Environment name': {
        return state.whatsApp ? 'whatsapp' : 'web'
      }
      case 'Custom':
      case undefined: {
        return options.expressionToEvaluate ?? null
      }
    }
  }

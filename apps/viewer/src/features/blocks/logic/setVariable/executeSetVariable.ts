import { SessionState, SetVariableBlock, Variable } from '@typebot.io/schemas'
import { byId } from '@typebot.io/lib'
import { ExecuteLogicResponse } from '@/features/chat/types'
import { updateVariables } from '@/features/variables/updateVariables'
import { parseVariables } from '@/features/variables/parseVariables'
import { parseGuessedValueType } from '@/features/variables/parseGuessedValueType'
import { parseScriptToExecuteClientSideAction } from '../script/executeScript'

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
  const newSessionState = updateVariables(state)([newVariable])
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
        return state.whatsApp?.contact.name ?? ''
      case 'Phone number':
        return state.whatsApp?.contact.phoneNumber ?? ''
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
        return 'Math.random().toString(36).substring(2, 15)'
      }
      case 'User ID': {
        return (
          state.typebotsQueue[0].resultId ??
          'Math.random().toString(36).substring(2, 15)'
        )
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
      case 'Custom':
      case undefined: {
        return options.expressionToEvaluate ?? null
      }
    }
  }

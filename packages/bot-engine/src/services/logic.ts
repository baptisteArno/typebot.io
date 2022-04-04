import { LinkedTypebot } from 'contexts/TypebotContext'
import { Log } from 'db'
import {
  LogicStep,
  LogicStepType,
  LogicalOperator,
  ConditionStep,
  Variable,
  ComparisonOperators,
  SetVariableStep,
  RedirectStep,
  Comparison,
  CodeStep,
  TypebotLinkStep,
  PublicTypebot,
  Typebot,
  Edge,
  VariableWithValue,
} from 'models'
import { byId, isDefined, isNotDefined, sendRequest } from 'utils'
import { sanitizeUrl } from './utils'
import { evaluateExpression, parseVariables } from './variable'

type EdgeId = string

type LogicContext = {
  isPreview: boolean
  apiHost: string
  typebot: PublicTypebot
  linkedTypebots: LinkedTypebot[]
  setCurrentTypebotId: (id: string) => void
  updateVariableValue: (variableId: string, value: string) => void
  updateVariables: (variables: VariableWithValue[]) => void
  injectLinkedTypebot: (typebot: Typebot | PublicTypebot) => LinkedTypebot
  onNewLog: (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) => void
  createEdge: (edge: Edge) => void
}

export const executeLogic = async (
  step: LogicStep,
  context: LogicContext
): Promise<{
  nextEdgeId?: EdgeId
  linkedTypebot?: PublicTypebot | LinkedTypebot
}> => {
  switch (step.type) {
    case LogicStepType.SET_VARIABLE:
      return { nextEdgeId: executeSetVariable(step, context) }
    case LogicStepType.CONDITION:
      return { nextEdgeId: executeCondition(step, context) }
    case LogicStepType.REDIRECT:
      return { nextEdgeId: executeRedirect(step, context) }
    case LogicStepType.CODE:
      return { nextEdgeId: await executeCode(step, context) }
    case LogicStepType.TYPEBOT_LINK:
      return await executeTypebotLink(step, context)
  }
}

const executeSetVariable = (
  step: SetVariableStep,
  { typebot: { variables }, updateVariableValue, updateVariables }: LogicContext
): EdgeId | undefined => {
  if (!step.options?.variableId || !step.options.expressionToEvaluate)
    return step.outgoingEdgeId
  const evaluatedExpression = evaluateExpression(variables)(
    step.options.expressionToEvaluate
  )
  const existingVariable = variables.find(byId(step.options.variableId))
  if (!existingVariable) return step.outgoingEdgeId
  updateVariableValue(existingVariable.id, evaluatedExpression)
  updateVariables([{ ...existingVariable, value: evaluatedExpression }])
  return step.outgoingEdgeId
}

const executeCondition = (
  step: ConditionStep,
  { typebot: { variables } }: LogicContext
): EdgeId | undefined => {
  const { content } = step.items[0]
  const isConditionPassed =
    content.logicalOperator === LogicalOperator.AND
      ? content.comparisons.every(executeComparison(variables))
      : content.comparisons.some(executeComparison(variables))
  return isConditionPassed ? step.items[0].outgoingEdgeId : step.outgoingEdgeId
}

const executeComparison =
  (variables: Variable[]) => (comparison: Comparison) => {
    if (!comparison?.variableId) return false
    const inputValue =
      variables.find((v) => v.id === comparison.variableId)?.value ?? ''
    const value = parseVariables(variables)(comparison.value)
    if (isNotDefined(value)) return false
    switch (comparison.comparisonOperator) {
      case ComparisonOperators.CONTAINS: {
        return inputValue.toString().includes(value.toString())
      }
      case ComparisonOperators.EQUAL: {
        return inputValue.toString() === value.toString()
      }
      case ComparisonOperators.NOT_EQUAL: {
        return inputValue.toString() !== value.toString()
      }
      case ComparisonOperators.GREATER: {
        return parseFloat(inputValue) >= parseFloat(value)
      }
      case ComparisonOperators.LESS: {
        return parseFloat(inputValue) <= parseFloat(value)
      }
      case ComparisonOperators.IS_SET: {
        return isDefined(inputValue) && inputValue.length > 0
      }
    }
  }

const executeRedirect = (
  step: RedirectStep,
  { typebot: { variables } }: LogicContext
): EdgeId | undefined => {
  if (!step.options?.url) return step.outgoingEdgeId
  window.open(
    sanitizeUrl(parseVariables(variables)(step.options?.url)),
    step.options.isNewTab ? '_blank' : '_self'
  )
  return step.outgoingEdgeId
}

const executeCode = async (
  step: CodeStep,
  { typebot: { variables } }: LogicContext
) => {
  if (!step.options.content) return
  const func = Function(
    ...variables.map((v) => v.id),
    parseVariables(variables, { fieldToParse: 'id' })(step.options.content)
  )
  await func(...variables.map((v) => v.value))
  return step.outgoingEdgeId
}

const executeTypebotLink = async (
  step: TypebotLinkStep,
  context: LogicContext
): Promise<{
  nextEdgeId?: EdgeId
  linkedTypebot?: PublicTypebot | LinkedTypebot
}> => {
  const { typebot, linkedTypebots, onNewLog, createEdge, setCurrentTypebotId } =
    context
  const linkedTypebot = (
    step.options.typebotId === 'current'
      ? typebot
      : [typebot, ...linkedTypebots].find(byId(step.options.typebotId)) ??
        (await fetchAndInjectTypebot(step, context))
  ) as PublicTypebot | LinkedTypebot | undefined
  if (!linkedTypebot) {
    onNewLog({
      status: 'error',
      description: 'Failed to link typebot',
      details: '',
    })
    return { nextEdgeId: step.outgoingEdgeId }
  }
  setCurrentTypebotId(
    'typebotId' in linkedTypebot ? linkedTypebot.typebotId : linkedTypebot.id
  )
  const nextBlockId =
    step.options.blockId ??
    linkedTypebot.blocks.find((b) => b.steps.some((s) => s.type === 'start'))
      ?.id
  if (!nextBlockId) return { nextEdgeId: step.outgoingEdgeId }
  const newEdge: Edge = {
    id: (Math.random() * 1000).toString(),
    from: { stepId: '', blockId: '' },
    to: {
      blockId: nextBlockId,
    },
  }
  createEdge(newEdge)
  return {
    nextEdgeId: newEdge.id,
    linkedTypebot: {
      ...linkedTypebot,
      edges: [...linkedTypebot.edges, newEdge],
    },
  }
}

const fetchAndInjectTypebot = async (
  step: TypebotLinkStep,
  { apiHost, injectLinkedTypebot, isPreview }: LogicContext
): Promise<LinkedTypebot | undefined> => {
  const { data, error } = isPreview
    ? await sendRequest<{ typebot: Typebot }>(
        `/api/typebots/${step.options.typebotId}`
      )
    : await sendRequest<{ typebot: PublicTypebot }>(
        `${apiHost}/api/publicTypebots/${step.options.typebotId}`
      )
  if (!data || error) return
  return injectLinkedTypebot(data.typebot)
}

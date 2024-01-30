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
  currentTypebotId: string
  pushEdgeIdInLinkedTypebotQueue: (bot: {
    edgeId: string
    typebotId: string
  }) => void
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
  if (!step.options?.variableId) return step.outgoingEdgeId
  const evaluatedExpression = step.options.expressionToEvaluate
    ? evaluateExpression(variables)(step.options.expressionToEvaluate)
    : undefined
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
    const inputValue = (
      variables.find((v) => v.id === comparison.variableId)?.value ?? ''
    )
      .toString()
      .trim()
    const value = parseVariables(variables)(comparison.value).toString().trim()
    if (isNotDefined(value)) return false
    switch (comparison.comparisonOperator) {
      case ComparisonOperators.CONTAINS: {
        return inputValue.toLowerCase().includes(value.toLowerCase())
      }
      case ComparisonOperators.NOT_CONTAINS: {
        return !inputValue.toLowerCase().includes(value.toLowerCase())
      }
      case ComparisonOperators.EQUAL: {
        return inputValue === value
      }
      case ComparisonOperators.NOT_EQUAL: {
        return inputValue !== value
      }
      case ComparisonOperators.GREATER: {
        return parseFloat(inputValue) > parseFloat(value)
      }
      case ComparisonOperators.GREATER_OR_EQUAL: {
        return parseFloat(inputValue) >= parseFloat(value)
      }
      case ComparisonOperators.LESS: {
        return parseFloat(inputValue) < parseFloat(value)
      }
      case ComparisonOperators.LESS_OR_EQUAL: {
        return parseFloat(inputValue) <= parseFloat(value)
      }
      case ComparisonOperators.EMPTY: {
        return inputValue === ''
      }
      case ComparisonOperators.NOT_EMPTY: {
        return inputValue !== ''
      }
      case ComparisonOperators.START_WITH: {
        return inputValue.toLowerCase().startsWith(value.toLowerCase())
      }
      case ComparisonOperators.NOT_START_WITH: {
        return !inputValue.toLowerCase().startsWith(value.toLowerCase())
      }
      case ComparisonOperators.END_WITH: {
        return inputValue.toLowerCase().endsWith(value.toLowerCase())
      }
      case ComparisonOperators.NOT_END_WITH: {
        return !inputValue.toLowerCase().endsWith(value.toLowerCase())
      }
    }
  }

const executeRedirect = (
  step: RedirectStep,
  { typebot: { variables } }: LogicContext
): EdgeId | undefined => {
  if (!step.options?.url) return step.outgoingEdgeId
  const tempLink = document.createElement('a')
  tempLink.href = sanitizeUrl(parseVariables(variables)(step.options?.url))
  tempLink.setAttribute('target', step.options.isNewTab ? '_blank' : '_self')
  tempLink.click()
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
  try {
    await func(...variables.map((v) => v.value))
  } catch (err) {
    console.error(err)
  }
  return step.outgoingEdgeId
}

const executeTypebotLink = async (
  step: TypebotLinkStep,
  context: LogicContext
): Promise<{
  nextEdgeId?: EdgeId
  linkedTypebot?: PublicTypebot | LinkedTypebot
}> => {
  const {
    typebot,
    linkedTypebots,
    onNewLog,
    createEdge,
    setCurrentTypebotId,
    pushEdgeIdInLinkedTypebotQueue,
    currentTypebotId,
  } = context
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
  if (step.outgoingEdgeId)
    pushEdgeIdInLinkedTypebotQueue({
      edgeId: step.outgoingEdgeId,
      typebotId: currentTypebotId,
    })
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
        `${process.env.BASE_PATH}/api/typebots/${step.options.typebotId}`
      )
    : await sendRequest<{ typebot: PublicTypebot }>(
        `${apiHost}/api/publicTypebots/${step.options.typebotId}`
      )
  if (!data || error) return
  return injectLinkedTypebot(data.typebot)
}

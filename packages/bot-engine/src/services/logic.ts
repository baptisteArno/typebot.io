import { TypebotViewerProps } from 'components/TypebotViewer'
import { LinkedTypebot } from 'contexts/TypebotContext'
import { Log } from 'db'
import {
  LogicBlock,
  LogicBlockType,
  LogicalOperator,
  ConditionBlock,
  Variable,
  ComparisonOperators,
  SetVariableBlock,
  RedirectBlock,
  Comparison,
  CodeBlock,
  TypebotLinkBlock,
  PublicTypebot,
  Typebot,
  Edge,
  VariableWithUnknowValue,
} from 'models'
import { byId, isDefined, isNotDefined, sendRequest } from 'utils'
import { sendEventToParent } from './chat'
import { isEmbedded, sanitizeUrl } from './utils'
import { parseCorrectValueType, parseVariables } from './variable'

type EdgeId = string

type LogicContext = {
  isPreview: boolean
  apiHost: string
  typebot: TypebotViewerProps['typebot']
  linkedTypebots: LinkedTypebot[]
  currentTypebotId: string
  pushEdgeIdInLinkedTypebotQueue: (bot: {
    edgeId: string
    typebotId: string
  }) => void
  setCurrentTypebotId: (id: string) => void
  updateVariableValue: (variableId: string, value: unknown) => void
  updateVariables: (variables: VariableWithUnknowValue[]) => void
  injectLinkedTypebot: (typebot: Typebot | PublicTypebot) => LinkedTypebot
  onNewLog: (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) => void
  createEdge: (edge: Edge) => void
}

export const executeLogic = async (
  block: LogicBlock,
  context: LogicContext
): Promise<{
  nextEdgeId?: EdgeId
  linkedTypebot?: TypebotViewerProps['typebot'] | LinkedTypebot
}> => {
  switch (block.type) {
    case LogicBlockType.SET_VARIABLE:
      return { nextEdgeId: executeSetVariable(block, context) }
    case LogicBlockType.CONDITION:
      return { nextEdgeId: executeCondition(block, context) }
    case LogicBlockType.REDIRECT:
      return { nextEdgeId: executeRedirect(block, context) }
    case LogicBlockType.CODE:
      return { nextEdgeId: await executeCode(block, context) }
    case LogicBlockType.TYPEBOT_LINK:
      return await executeTypebotLink(block, context)
  }
}

const executeSetVariable = (
  block: SetVariableBlock,
  { typebot: { variables }, updateVariableValue, updateVariables }: LogicContext
): EdgeId | undefined => {
  if (!block.options?.variableId) return block.outgoingEdgeId
  const evaluatedExpression = block.options.expressionToEvaluate
    ? evaluateSetVariableExpression(variables)(
        block.options.expressionToEvaluate
      )
    : undefined
  const existingVariable = variables.find(byId(block.options.variableId))
  if (!existingVariable) return block.outgoingEdgeId
  updateVariableValue(existingVariable.id, evaluatedExpression)
  updateVariables([{ ...existingVariable, value: evaluatedExpression }])
  return block.outgoingEdgeId
}

const evaluateSetVariableExpression =
  (variables: Variable[]) =>
  (str: string): unknown => {
    const evaluating = parseVariables(variables, { fieldToParse: 'id' })(
      str.includes('return ') ? str : `return ${str}`
    )
    try {
      const func = Function(...variables.map((v) => v.id), evaluating)
      return func(...variables.map((v) => parseCorrectValueType(v.value)))
    } catch (err) {
      console.log(`Evaluating: ${evaluating}`, err)
      return str
    }
  }

const executeCondition = (
  block: ConditionBlock,
  { typebot: { variables } }: LogicContext
): EdgeId | undefined => {
  const { content } = block.items[0]
  const isConditionPassed =
    content.logicalOperator === LogicalOperator.AND
      ? content.comparisons.every(executeComparison(variables))
      : content.comparisons.some(executeComparison(variables))
  return isConditionPassed
    ? block.items[0].outgoingEdgeId
    : block.outgoingEdgeId
}

const executeComparison =
  (variables: Variable[]) => (comparison: Comparison) => {
    if (!comparison?.variableId) return false
    const inputValue = (
      variables.find((v) => v.id === comparison.variableId)?.value ?? ''
    ).trim()
    const value = parseVariables(variables)(comparison.value).trim()
    if (isNotDefined(value)) return false
    switch (comparison.comparisonOperator) {
      case ComparisonOperators.CONTAINS: {
        return inputValue.toLowerCase().includes(value.toLowerCase())
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
      case ComparisonOperators.LESS: {
        return parseFloat(inputValue) < parseFloat(value)
      }
      case ComparisonOperators.IS_SET: {
        return isDefined(inputValue) && inputValue.length > 0
      }
    }
  }

const executeRedirect = (
  block: RedirectBlock,
  { typebot: { variables } }: LogicContext
): EdgeId | undefined => {
  if (!block.options?.url) return block.outgoingEdgeId
  const formattedUrl = sanitizeUrl(parseVariables(variables)(block.options.url))
  const isEmbedded = window.parent && window.location !== window.top?.location
  if (isEmbedded) {
    if (!block.options.isNewTab)
      return ((window.top as Window).location.href = formattedUrl)

    try {
      window.open(formattedUrl)
    } catch (err) {
      sendEventToParent({ redirectUrl: formattedUrl })
    }
  } else {
    window.open(formattedUrl, block.options.isNewTab ? '_blank' : '_self')
  }
  return block.outgoingEdgeId
}

const executeCode = async (
  block: CodeBlock,
  { typebot: { variables } }: LogicContext
) => {
  if (!block.options.content) return
  if (block.options.shouldExecuteInParentContext && isEmbedded) {
    sendEventToParent({
      codeToExecute: parseVariables(variables)(block.options.content),
    })
  } else {
    const func = Function(
      ...variables.map((v) => v.id),
      parseVariables(variables, { fieldToParse: 'id' })(block.options.content)
    )
    try {
      await func(...variables.map((v) => parseCorrectValueType(v.value)))
    } catch (err) {
      console.error(err)
    }
  }

  return block.outgoingEdgeId
}

const executeTypebotLink = async (
  block: TypebotLinkBlock,
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
    block.options.typebotId === 'current'
      ? typebot
      : [typebot, ...linkedTypebots].find(byId(block.options.typebotId)) ??
        (await fetchAndInjectTypebot(block, context))
  ) as PublicTypebot | LinkedTypebot | undefined
  if (!linkedTypebot) {
    onNewLog({
      status: 'error',
      description: 'Failed to link typebot',
      details: '',
    })
    return { nextEdgeId: block.outgoingEdgeId }
  }
  if (block.outgoingEdgeId)
    pushEdgeIdInLinkedTypebotQueue({
      edgeId: block.outgoingEdgeId,
      typebotId: currentTypebotId,
    })
  setCurrentTypebotId(
    'typebotId' in linkedTypebot ? linkedTypebot.typebotId : linkedTypebot.id
  )
  const nextGroupId =
    block.options.groupId ??
    linkedTypebot.groups.find((b) => b.blocks.some((s) => s.type === 'start'))
      ?.id
  if (!nextGroupId) return { nextEdgeId: block.outgoingEdgeId }
  const newEdge: Edge = {
    id: (Math.random() * 1000).toString(),
    from: { blockId: '', groupId: '' },
    to: {
      groupId: nextGroupId,
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
  block: TypebotLinkBlock,
  { apiHost, injectLinkedTypebot, isPreview }: LogicContext
): Promise<LinkedTypebot | undefined> => {
  const { data, error } = isPreview
    ? await sendRequest<{ typebot: Typebot }>(
        `/api/typebots/${block.options.typebotId}`
      )
    : await sendRequest<{ typebot: PublicTypebot }>(
        `${apiHost}/api/publicTypebots/${block.options.typebotId}`
      )
  if (!data || error) return
  return injectLinkedTypebot(data.typebot)
}

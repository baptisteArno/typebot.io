import {
  Answer,
  SessionState,
  SetVariableBlock,
  SetVariableHistoryItem,
  Variable,
} from '@typebot.io/schemas'
import { byId, isEmpty } from '@typebot.io/lib'
import { ExecuteLogicResponse } from '../../../types'
import { parseScriptToExecuteClientSideAction } from '../script/executeScript'
import { parseVariables } from '@typebot.io/variables/parseVariables'
import { updateVariablesInSession } from '@typebot.io/variables/updateVariablesInSession'
import { createId } from '@paralleldrive/cuid2'
import { utcToZonedTime, format as tzFormat } from 'date-fns-tz'
import {
  computeResultTranscript,
  parseTranscriptMessageText,
} from '@typebot.io/logic/computeResultTranscript'
import prisma from '@typebot.io/lib/prisma'
import {
  defaultSetVariableOptions,
  sessionOnlySetVariableOptions,
} from '@typebot.io/schemas/features/blocks/logic/setVariable/constants'
import { createCodeRunner } from '@typebot.io/variables/codeRunners'
import { stringifyError } from '@typebot.io/lib/stringifyError'

export const executeSetVariable = async (
  state: SessionState,
  block: SetVariableBlock
): Promise<ExecuteLogicResponse> => {
  const { variables } = state.typebotsQueue[0].typebot
  if (!block.options?.variableId)
    return {
      outgoingEdgeId: block.outgoingEdgeId,
    }
  const expressionToEvaluate = await getExpressionToEvaluate(state)(
    block.options,
    block.id
  )
  const isCustomValue = !block.options.type || block.options.type === 'Custom'
  const isCode =
    (!block.options.type || block.options.type === 'Custom') &&
    (block.options.isCode ?? defaultSetVariableOptions.isCode)
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
          type: 'setVariable',
          setVariable: {
            scriptToExecute: {
              ...scriptToExecute,
              isCode,
            },
          },
          expectsDedicatedReply: true,
        },
      ],
    }
  }
  const { value, error } =
    (expressionToEvaluate
      ? evaluateSetVariableExpression(variables)(expressionToEvaluate)
      : undefined) ?? {}
  const existingVariable = variables.find(byId(block.options.variableId))
  if (!existingVariable) return { outgoingEdgeId: block.outgoingEdgeId }
  const newVariable = {
    ...existingVariable,
    value,
  }
  const { newSetVariableHistory, updatedState } = updateVariablesInSession({
    state,
    newVariables: [
      {
        ...newVariable,
        isSessionVariable: sessionOnlySetVariableOptions.includes(
          block.options.type as (typeof sessionOnlySetVariableOptions)[number]
        )
          ? true
          : newVariable.isSessionVariable,
      },
    ],
    currentBlockId: block.id,
  })

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    newSessionState: updatedState,
    newSetVariableHistory,
    logs:
      error && isCode
        ? [
            {
              status: 'error',
              description: 'Error evaluating Set variable code',
              details: error,
            },
          ]
        : undefined,
  }
}

const evaluateSetVariableExpression =
  (variables: Variable[]) =>
  (str: string): { value: unknown; error?: string } => {
    const isSingleVariable =
      str.startsWith('{{') && str.endsWith('}}') && str.split('{{').length === 2
    if (isSingleVariable) return { value: parseVariables(variables)(str) }
    // To avoid octal number evaluation
    if (!isNaN(str as unknown as number) && /0[^.].+/.test(str))
      return { value: str }
    try {
      const body = parseVariables(variables, { fieldToParse: 'id' })(str)
      return {
        value: createCodeRunner({ variables })(
          body.includes('return ') ? body : `return ${body}`
        ),
      }
    } catch (err) {
      return {
        value: parseVariables(variables)(str),
        error: stringifyError(err),
      }
    }
  }

const getExpressionToEvaluate =
  (state: SessionState) =>
  async (
    options: SetVariableBlock['options'],
    blockId: string
  ): Promise<string | null> => {
    switch (options?.type) {
      case 'Contact name':
        return state.whatsApp?.contact.name ?? null
      case 'Phone number': {
        const phoneNumber = state.whatsApp?.contact.phoneNumber
        return phoneNumber ? `"${state.whatsApp?.contact.phoneNumber}"` : null
      }
      case 'Now': {
        const timeZone = parseVariables(
          state.typebotsQueue[0].typebot.variables
        )(options.timeZone)
        if (isEmpty(timeZone)) return 'new Date().toISOString()'
        return toISOWithTz(new Date(), timeZone)
      }

      case 'Today':
        return 'new Date().toISOString()'
      case 'Tomorrow': {
        const timeZone = parseVariables(
          state.typebotsQueue[0].typebot.variables
        )(options.timeZone)
        if (isEmpty(timeZone))
          return 'new Date(Date.now() + 86400000).toISOString()'
        return toISOWithTz(new Date(Date.now() + 86400000), timeZone)
      }
      case 'Yesterday': {
        const timeZone = parseVariables(
          state.typebotsQueue[0].typebot.variables
        )(options.timeZone)
        if (isEmpty(timeZone))
          return 'new Date(Date.now() - 86400000).toISOString()'
        return toISOWithTz(new Date(Date.now() - 86400000), timeZone)
      }
      case 'Random ID': {
        return `"${createId()}"`
      }
      case 'Result ID':
      case 'User ID': {
        return state.typebotsQueue[0].resultId ?? `"${createId()}"`
      }
      case 'Map item with same index': {
        return `const itemIndex = ${options.mapListItemParams?.baseListVariableId}.indexOf(${options.mapListItemParams?.baseItemVariableId})
      return ${options.mapListItemParams?.targetListVariableId}.at(itemIndex)`
      }
      case 'Append value(s)': {
        const item = parseVariables(state.typebotsQueue[0].typebot.variables)(
          options.item
        )
        return `if(\`${item}\` === '') return ${options.variableId};
        if(!${options.variableId}) return [\`${item}\`];
        if(!Array.isArray(${options.variableId})) return [${options.variableId}, \`${item}\`];
        return (${options.variableId}).concat(\`${item}\`);`
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
      case 'Transcript': {
        const props = await parseTranscriptProps(state)
        if (!props) return ''
        const typebotWithEmptyVariables = {
          ...state.typebotsQueue[0].typebot,
          variables: state.typebotsQueue[0].typebot.variables.map((v) => ({
            ...v,
            value: undefined,
          })),
        }
        const transcript = computeResultTranscript({
          typebot: typebotWithEmptyVariables,
          stopAtBlockId: blockId,
          ...props,
        })
        return (
          'return `' +
          transcript
            .map(
              (message) =>
                `${
                  message.role === 'bot' ? 'Assistant:' : 'User:'
                } "${parseTranscriptMessageText(message)}"`
            )
            .join('\n\n') +
          '`'
        )
      }
      case 'Custom':
      case undefined: {
        return options?.expressionToEvaluate ?? null
      }
    }
  }

const toISOWithTz = (date: Date, timeZone: string) => {
  const zonedDate = utcToZonedTime(date, timeZone)
  return tzFormat(zonedDate, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone })
}

type ParsedTranscriptProps = {
  answers: Pick<Answer, 'blockId' | 'content'>[]
  setVariableHistory: Pick<
    SetVariableHistoryItem,
    'blockId' | 'variableId' | 'value'
  >[]
  visitedEdges: string[]
}

const parseTranscriptProps = async (
  state: SessionState
): Promise<ParsedTranscriptProps | undefined> => {
  if (!state.typebotsQueue[0].resultId)
    return parsePreviewTranscriptProps(state)
  return parseResultTranscriptProps(state)
}

const parsePreviewTranscriptProps = async (
  state: SessionState
): Promise<ParsedTranscriptProps | undefined> => {
  if (!state.previewMetadata) return
  return {
    answers: state.previewMetadata.answers ?? [],
    setVariableHistory: state.previewMetadata.setVariableHistory ?? [],
    visitedEdges: state.previewMetadata.visitedEdges ?? [],
  }
}

const parseResultTranscriptProps = async (
  state: SessionState
): Promise<ParsedTranscriptProps | undefined> => {
  const result = await prisma.result.findUnique({
    where: {
      id: state.typebotsQueue[0].resultId,
    },
    select: {
      edges: {
        select: {
          edgeId: true,
          index: true,
        },
      },
      answers: {
        select: {
          blockId: true,
          content: true,
          createdAt: true,
        },
      },
      answersV2: {
        select: {
          blockId: true,
          content: true,
          createdAt: true,
        },
      },
      setVariableHistory: {
        select: {
          blockId: true,
          variableId: true,
          index: true,
          value: true,
        },
      },
    },
  })
  if (!result) return
  return {
    answers: result.answersV2
      .concat(result.answers)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
    setVariableHistory: (
      result.setVariableHistory as SetVariableHistoryItem[]
    ).sort((a, b) => a.index - b.index),
    visitedEdges: result.edges
      .sort((a, b) => a.index - b.index)
      .map((edge) => edge.edgeId),
  }
}

import prisma from '@typebot.io/lib/prisma'
import { Prisma, SetVariableHistoryItem, VisitedEdge } from '@typebot.io/prisma'
import { ContinueChatResponse, TypebotInSession } from '@typebot.io/schemas'
import { filterNonSessionVariablesWithValues } from '@typebot.io/variables/filterVariablesWithValues'
import { formatLogDetails } from '../logs/helpers/formatLogDetails'

type Props = {
  resultId: string
  typebot: TypebotInSession
  hasStarted: boolean
  isCompleted: boolean
  lastChatSessionId?: string
  logs?: ContinueChatResponse['logs']
  visitedEdges?: VisitedEdge[]
  setVariableHistory?: SetVariableHistoryItem[]
}
export const upsertResult = ({
  resultId,
  typebot,
  hasStarted,
  isCompleted,
  lastChatSessionId,
  logs,
  visitedEdges,
  setVariableHistory,
}: Props): Prisma.PrismaPromise<any> => {
  const variablesWithValue = filterNonSessionVariablesWithValues(
    typebot.variables
  )
  const logsToCreate =
    logs && logs.length > 0
      ? {
          createMany: {
            data: logs.map((log) => ({
              ...log,
              details: formatLogDetails(log.details),
            })),
            skipDuplicates: true,
          },
        }
      : undefined

  const setVariableHistoryToCreate =
    setVariableHistory && setVariableHistory.length > 0
      ? ({
          createMany: {
            data: setVariableHistory.map((item) => ({
              ...item,
              value: item.value === null ? Prisma.JsonNull : item.value,
              resultId: undefined,
            })),
            skipDuplicates: true,
          },
        } as Prisma.SetVariableHistoryItemUpdateManyWithoutResultNestedInput)
      : undefined

  const visitedEdgesToCreate =
    visitedEdges && visitedEdges.length > 0
      ? {
          createMany: {
            data: visitedEdges.map((edge) => ({
              ...edge,
              resultId: undefined,
            })),
            skipDuplicates: true,
          },
        }
      : undefined

  return prisma.result.upsert({
    where: { id: resultId },
    update: {
      isCompleted: isCompleted ? true : undefined,
      hasStarted,
      variables: variablesWithValue,
      lastChatSessionId,
      logs: logsToCreate,
      setVariableHistory: setVariableHistoryToCreate,
      edges: visitedEdgesToCreate,
    },
    create: {
      id: resultId,
      typebotId: typebot.id,
      isCompleted: isCompleted ? true : false,
      hasStarted,
      variables: variablesWithValue,
      lastChatSessionId,
      logs: logsToCreate,
      setVariableHistory: setVariableHistoryToCreate,
      edges: visitedEdgesToCreate,
    },
    select: { id: true },
  })
}

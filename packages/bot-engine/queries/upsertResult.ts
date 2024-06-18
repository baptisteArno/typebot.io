import prisma from '@sniper.io/lib/prisma'
import { Prisma, SetVariableHistoryItem, VisitedEdge } from '@sniper.io/prisma'
import { ContinueChatResponse, SniperInSession } from '@sniper.io/schemas'
import { filterNonSessionVariablesWithValues } from '@sniper.io/variables/filterVariablesWithValues'
import { formatLogDetails } from '../logs/helpers/formatLogDetails'

type Props = {
  resultId: string
  sniper: SniperInSession
  hasStarted: boolean
  isCompleted: boolean
  lastChatSessionId?: string
  logs?: ContinueChatResponse['logs']
  visitedEdges?: VisitedEdge[]
  setVariableHistory?: SetVariableHistoryItem[]
}
export const upsertResult = ({
  resultId,
  sniper,
  hasStarted,
  isCompleted,
  lastChatSessionId,
  logs,
  visitedEdges,
  setVariableHistory,
}: Props): Prisma.PrismaPromise<any> => {
  const variablesWithValue = filterNonSessionVariablesWithValues(
    sniper.variables
  )
  const logsToCreate =
    logs && logs.length > 0
      ? {
          createMany: {
            data: logs.map((log) => ({
              ...log,
              details: formatLogDetails(log.details),
            })),
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
      sniperId: sniper.id,
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

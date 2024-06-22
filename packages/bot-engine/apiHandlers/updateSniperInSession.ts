import { TRPCError } from '@trpc/server'
import prisma from '@sniper.io/lib/prisma'
import {
  SessionState,
  Variable,
  PublicSniper,
  Sniper,
} from '@sniper.io/schemas'
import { getSession } from '../queries/getSession'

type Props = {
  user?: { id: string }
  sessionId: string
}

export const updateSniperInSession = async ({ user, sessionId }: Props) => {
  if (!user)
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' })
  const session = await getSession(sessionId)
  if (!session)
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' })

  const publicSniper = (await prisma.publicSniper.findFirst({
    where: {
      sniper: {
        id: session.state.snipersQueue[0].sniper.id,
        OR: [
          {
            workspace: {
              members: {
                some: { userId: user.id, role: { in: ['ADMIN', 'MEMBER'] } },
              },
            },
          },
          {
            collaborators: {
              some: { userId: user.id, type: { in: ['WRITE'] } },
            },
          },
        ],
      },
    },
    select: {
      edges: true,
      groups: true,
      variables: true,
    },
  })) as Pick<PublicSniper, 'edges' | 'variables' | 'groups'> | null

  if (!publicSniper)
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' })

  const newSessionState = updateSessionState(session.state, publicSniper)

  await prisma.chatSession.updateMany({
    where: { id: session.id },
    data: { state: newSessionState },
  })

  return { message: 'success' } as const
}

const updateSessionState = (
  currentState: SessionState,
  newSniper: Pick<PublicSniper, 'edges' | 'variables' | 'groups'>
): SessionState => ({
  ...currentState,
  snipersQueue: currentState.snipersQueue.map((sniperInQueue, index) =>
    index === 0
      ? {
          ...sniperInQueue,
          sniper: {
            ...sniperInQueue.sniper,
            edges: newSniper.edges,
            groups: newSniper.groups,
            variables: updateVariablesInSession(
              sniperInQueue.sniper.variables,
              newSniper.variables
            ),
          },
        }
      : sniperInQueue
  ) as SessionState['snipersQueue'],
})

const updateVariablesInSession = (
  currentVariables: Variable[],
  newVariables: Sniper['variables']
): Variable[] => [
  ...currentVariables,
  ...newVariables.filter(
    (newVariable) =>
      !currentVariables.find(
        (currentVariable) => currentVariable.id === newVariable.id
      )
  ),
]

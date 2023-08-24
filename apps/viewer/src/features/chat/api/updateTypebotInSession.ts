import { publicProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { getSession } from '../queries/getSession'
import prisma from '@/lib/prisma'
import {
  PublicTypebot,
  SessionState,
  Typebot,
  Variable,
} from '@typebot.io/schemas'

export const updateTypebotInSession = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/sessions/{sessionId}/updateTypebot',
      summary: 'Update typebot in session',
      description:
        'Update chat session with latest typebot modifications. This is useful when you want to update the typebot in an ongoing session after making changes to it.',
      protect: true,
    },
  })
  .input(
    z.object({
      sessionId: z.string(),
    })
  )
  .output(z.object({ message: z.literal('success') }))
  .mutation(async ({ input: { sessionId }, ctx: { user } }) => {
    if (!user)
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' })
    const session = await getSession(sessionId)
    if (!session)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' })

    const publicTypebot = (await prisma.publicTypebot.findFirst({
      where: {
        typebot: {
          id: session.state.typebotsQueue[0].typebot.id,
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
    })) as Pick<PublicTypebot, 'edges' | 'variables' | 'groups'> | null

    if (!publicTypebot)
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' })

    const newSessionState = updateSessionState(session.state, publicTypebot)

    await prisma.chatSession.updateMany({
      where: { id: session.id },
      data: { state: newSessionState },
    })

    return { message: 'success' }
  })

const updateSessionState = (
  currentState: SessionState,
  newTypebot: Pick<PublicTypebot, 'edges' | 'variables' | 'groups'>
): SessionState => ({
  ...currentState,
  typebotsQueue: currentState.typebotsQueue.map((typebotInQueue, index) =>
    index === 0
      ? {
          ...typebotInQueue,
          typebot: {
            ...typebotInQueue.typebot,
            edges: newTypebot.edges,
            groups: newTypebot.groups,
            variables: updateVariablesInSession(
              typebotInQueue.typebot.variables,
              newTypebot.variables
            ),
          },
        }
      : typebotInQueue
  ),
})

const updateVariablesInSession = (
  currentVariables: Variable[],
  newVariables: Typebot['variables']
): Variable[] => [
  ...currentVariables,
  ...newVariables.filter(
    (newVariable) =>
      !currentVariables.find(
        (currentVariable) => currentVariable.id === newVariable.id
      )
  ),
]

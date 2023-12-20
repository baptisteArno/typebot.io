import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { encrypt } from '@typebot.io/lib/api/encryption/encrypt'
import { z } from 'zod'
import { isWriteWorkspaceForbidden } from '@/features/workspace/helpers/isWriteWorkspaceForbidden'
import { forgedCredentialsSchemas } from '@typebot.io/forge-schemas'

const inputShape = {
  data: true,
  type: true,
  workspaceId: true,
  name: true,
} as const

export const createCredentials = authenticatedProcedure
  .input(
    z.object({
      credentials: z.discriminatedUnion(
        'type',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        forgedCredentialsSchemas.map((i) => i.pick(inputShape))
      ),
    })
  )
  .mutation(async ({ input: { credentials }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: credentials.workspaceId,
      },
      select: { id: true, members: true },
    })
    if (!workspace || isWriteWorkspaceForbidden(workspace, user))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })

    const { encryptedData, iv } = await encrypt(credentials.data)
    const createdCredentials = await prisma.credentials.create({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      data: {
        ...credentials,
        data: encryptedData,
        iv,
      },
      select: {
        id: true,
      },
    })
    return { credentialsId: createdCredentials.id }
  })

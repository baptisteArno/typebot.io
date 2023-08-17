import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { stripeCredentialsSchema } from '@typebot.io/schemas/features/blocks/inputs/payment/schemas'
import { googleSheetsCredentialsSchema } from '@typebot.io/schemas/features/blocks/integrations/googleSheets/schemas'
import { openAICredentialsSchema } from '@typebot.io/schemas/features/blocks/integrations/openai'
import { smtpCredentialsSchema } from '@typebot.io/schemas/features/blocks/integrations/sendEmail'
import { encrypt } from '@typebot.io/lib/api/encryption'
import { z } from 'zod'
import { isWriteWorkspaceForbidden } from '@/features/workspace/helpers/isWriteWorkspaceForbidden copy'

const inputShape = {
  data: true,
  type: true,
  workspaceId: true,
  name: true,
} as const

export const createCredentials = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/credentials',
      protect: true,
      summary: 'Create credentials',
      tags: ['Credentials'],
    },
  })
  .input(
    z.object({
      credentials: z.discriminatedUnion('type', [
        stripeCredentialsSchema.pick(inputShape),
        smtpCredentialsSchema.pick(inputShape),
        googleSheetsCredentialsSchema.pick(inputShape),
        openAICredentialsSchema.pick(inputShape),
      ]),
    })
  )
  .output(
    z.object({
      credentialsId: z.string(),
    })
  )
  .mutation(async ({ input: { credentials }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: credentials.workspaceId,
      },
      select: { id: true, members: true },
    })
    if (!workspace || (await isWriteWorkspaceForbidden(workspace, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })

    const { encryptedData, iv } = await encrypt(credentials.data)
    const createdCredentials = await prisma.credentials.create({
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

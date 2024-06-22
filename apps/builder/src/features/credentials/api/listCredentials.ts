import prisma from '@sniper.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { openAICredentialsSchema } from '@sniper.io/schemas/features/blocks/integrations/openai'
import { smtpCredentialsSchema } from '@sniper.io/schemas/features/blocks/integrations/sendEmail'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'
import { whatsAppCredentialsSchema } from '@sniper.io/schemas/features/whatsapp'
import { zemanticAiCredentialsSchema } from '@sniper.io/schemas/features/blocks/integrations/zemanticAi'
import {
  googleSheetsCredentialsSchema,
  stripeCredentialsSchema,
} from '@sniper.io/schemas'

export const listCredentials = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/credentials',
      protect: true,
      summary: 'List workspace credentials',
      tags: ['Credentials'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      type: stripeCredentialsSchema.shape.type
        .or(smtpCredentialsSchema.shape.type)
        .or(googleSheetsCredentialsSchema.shape.type)
        .or(openAICredentialsSchema.shape.type)
        .or(whatsAppCredentialsSchema.shape.type)
        .or(zemanticAiCredentialsSchema.shape.type),
    })
  )
  .output(
    z.object({
      credentials: z.array(z.object({ id: z.string(), name: z.string() })),
    })
  )
  .query(async ({ input: { workspaceId, type }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
      },
      select: {
        id: true,
        members: true,
        credentials: {
          where: {
            type,
          },
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })

    return { credentials: workspace.credentials }
  })

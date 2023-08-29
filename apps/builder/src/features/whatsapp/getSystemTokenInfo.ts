import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import got from 'got'
import { TRPCError } from '@trpc/server'
import { WhatsAppCredentials } from '@typebot.io/schemas/features/whatsapp'
import prisma from '@/lib/prisma'
import { decrypt } from '@typebot.io/lib/api/encryption'

const inputSchema = z.object({
  token: z.string().optional(),
  credentialsId: z.string().optional(),
})

export const getSystemTokenInfo = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/whatsapp/systemToken',
      protect: true,
    },
  })
  .input(inputSchema)
  .output(
    z.object({
      appId: z.string(),
      appName: z.string(),
      expiresAt: z.number(),
      scopes: z.array(z.string()),
    })
  )
  .query(async ({ input, ctx: { user } }) => {
    if (!input.token && !input.credentialsId)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Either token or credentialsId must be provided',
      })
    const credentials = await getCredentials(user.id, input)
    if (!credentials)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Credentials not found',
      })
    const {
      data: { expires_at, scopes, app_id, application },
    } = (await got(
      `https://graph.facebook.com/v17.0/debug_token?input_token=${credentials.systemUserAccessToken}`,
      {
        headers: {
          Authorization: `Bearer ${credentials.systemUserAccessToken}`,
        },
      }
    ).json()) as {
      data: {
        app_id: string
        application: string
        expires_at: number
        scopes: string[]
      }
    }

    return {
      appId: app_id,
      appName: application,
      expiresAt: expires_at,
      scopes,
    }
  })

const getCredentials = async (
  userId: string,
  input: z.infer<typeof inputSchema>
): Promise<Omit<WhatsAppCredentials['data'], 'phoneNumberId'> | undefined> => {
  if (input.token)
    return {
      systemUserAccessToken: input.token,
    }
  const credentials = await prisma.credentials.findUnique({
    where: {
      id: input.credentialsId,
      workspace: { members: { some: { userId } } },
    },
  })
  if (!credentials) return
  return (await decrypt(
    credentials.data,
    credentials.iv
  )) as WhatsAppCredentials['data']
}

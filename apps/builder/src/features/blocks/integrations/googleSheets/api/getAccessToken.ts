import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'
import { decrypt } from '@typebot.io/lib/api/encryption/decrypt'
import { GoogleSheetsCredentials } from '@typebot.io/schemas'
import { OAuth2Client } from 'google-auth-library'
import { env } from '@typebot.io/env'

export const getAccessToken = authenticatedProcedure
  .input(
    z.object({
      workspaceId: z.string(),
      credentialsId: z.string(),
    })
  )
  .query(async ({ input: { workspaceId, credentialsId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
      },
      select: {
        id: true,
        members: true,
        credentials: {
          where: {
            id: credentialsId,
          },
          select: {
            data: true,
            iv: true,
          },
        },
      },
    })
    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })

    const credentials = workspace.credentials[0]
    if (!credentials)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Credentials not found',
      })
    const decryptedCredentials = (await decrypt(
      credentials.data,
      credentials.iv
    )) as GoogleSheetsCredentials['data']

    const client = new OAuth2Client({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri: `${env.NEXTAUTH_URL}/api/credentials/google-sheets/callback`,
    })

    client.setCredentials(decryptedCredentials)

    return { accessToken: (await client.getAccessToken()).token }
  })

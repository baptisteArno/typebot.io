import prisma from '@sniper.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import {
  methodNotAllowed,
  notAuthenticated,
  notFound,
} from '@sniper.io/lib/api'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'
import { WhatsAppCredentials } from '@sniper.io/schemas/features/whatsapp'
import { decrypt } from '@sniper.io/lib/api/encryption/decrypt'
import { downloadMedia } from '@sniper.io/bot-engine/whatsapp/downloadMedia'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await getAuthenticatedUser(req, res)
    if (!user) return notAuthenticated(res)

    const sniperId = req.query.sniperId as string

    const sniper = await prisma.sniper.findFirst({
      where: {
        id: sniperId,
      },
      select: {
        whatsAppCredentialsId: true,
        workspace: {
          select: {
            credentials: {
              where: {
                type: 'whatsApp',
              },
            },
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    })

    if (!sniper?.workspace || isReadWorkspaceFobidden(sniper.workspace, user))
      return notFound(res, 'Workspace not found')

    if (!sniper) return notFound(res, 'Sniper not found')

    const mediaId = req.query.mediaId as string
    const credentialsId = sniper.whatsAppCredentialsId

    const credentials = sniper.workspace.credentials.find(
      (credential) => credential.id === credentialsId
    )

    if (!credentials) return notFound(res, 'Credentials not found')

    const credentialsData = (await decrypt(
      credentials.data,
      credentials.iv
    )) as WhatsAppCredentials['data']

    const { file, mimeType } = await downloadMedia({
      mediaId,
      systemUserAccessToken: credentialsData.systemUserAccessToken,
    })

    res.setHeader('Content-Type', mimeType)
    res.setHeader('Cache-Control', 'public, max-age=86400')

    return res.send(file)
  }
  return methodNotAllowed(res)
}

export default handler

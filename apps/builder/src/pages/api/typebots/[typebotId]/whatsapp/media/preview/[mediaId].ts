import prisma from '@typebot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import {
  methodNotAllowed,
  notAuthenticated,
  notFound,
} from '@typebot.io/lib/api'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'
import { downloadMedia } from '@typebot.io/bot-engine/whatsapp/downloadMedia'
import { env } from '@typebot.io/env'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    if (!env.META_SYSTEM_USER_TOKEN)
      return res
        .status(400)
        .json({ error: 'Meta system user token is not set' })
    const user = await getAuthenticatedUser(req, res)
    if (!user) return notAuthenticated(res)

    const typebotId = req.query.typebotId as string

    const typebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
      },
      select: {
        whatsAppCredentialsId: true,
        workspace: {
          select: {
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    })

    if (!typebot?.workspace || isReadWorkspaceFobidden(typebot.workspace, user))
      return notFound(res, 'Workspace not found')

    if (!typebot) return notFound(res, 'Typebot not found')

    const mediaId = req.query.mediaId as string

    const { file, mimeType } = await downloadMedia({
      mediaId,
      systemUserAccessToken: env.META_SYSTEM_USER_TOKEN,
    })

    res.setHeader('Content-Type', mimeType)
    res.setHeader('Cache-Control', 'public, max-age=86400')

    return res.send(file)
  }
  return methodNotAllowed(res)
}

export default handler

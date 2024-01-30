import prisma from '@typebot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import {
  badRequest,
  methodNotAllowed,
  notAuthenticated,
  notFound,
} from '@typebot.io/lib/api'
import { getFileTempUrl } from '@typebot.io/lib/s3/getFileTempUrl'
import { isReadTypebotForbidden } from '@/features/typebot/helpers/isReadTypebotForbidden'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await getAuthenticatedUser(req, res)
    if (!user) return notAuthenticated(res)

    const typebotId = req.query.typebotId as string
    const resultId = req.query.resultId as string
    const fileName = req.query.fileName as string

    if (!fileName) return badRequest(res, 'fileName missing not found')

    const typebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
      },
      select: {
        whatsAppCredentialsId: true,
        collaborators: {
          select: {
            userId: true,
          },
        },
        workspace: {
          select: {
            id: true,
            isSuspended: true,
            isPastDue: true,
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    })

    if (!typebot?.workspace || (await isReadTypebotForbidden(typebot, user)))
      return notFound(res, 'Workspace not found')

    if (!typebot) return notFound(res, 'Typebot not found')

    const tmpUrl = await getFileTempUrl({
      key: `private/workspaces/${typebot.workspace.id}/typebots/${typebotId}/results/${resultId}/${fileName}`,
    })

    if (!tmpUrl) return notFound(res, 'File not found')

    return res.redirect(tmpUrl)
  }
  return methodNotAllowed(res)
}

export default handler

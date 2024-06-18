import prisma from '@sniper.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import {
  badRequest,
  methodNotAllowed,
  notAuthenticated,
  notFound,
} from '@sniper.io/lib/api'
import { getFileTempUrl } from '@sniper.io/lib/s3/getFileTempUrl'
import { isReadSniperForbidden } from '@/features/sniper/helpers/isReadSniperForbidden'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await getAuthenticatedUser(req, res)
    if (!user) return notAuthenticated(res)

    const sniperId = req.query.sniperId as string
    const resultId = req.query.resultId as string
    const fileName = req.query.fileName as string

    if (!fileName) return badRequest(res, 'fileName missing not found')

    const sniper = await prisma.sniper.findFirst({
      where: {
        id: sniperId,
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

    if (!sniper?.workspace || (await isReadSniperForbidden(sniper, user)))
      return notFound(res, 'Workspace not found')

    if (!sniper) return notFound(res, 'Sniper not found')

    const tmpUrl = await getFileTempUrl({
      key: `private/workspaces/${sniper.workspace.id}/snipers/${sniperId}/results/${resultId}/${fileName}`,
    })

    if (!tmpUrl) return notFound(res, 'File not found')

    return res.redirect(tmpUrl)
  }
  return methodNotAllowed(res)
}

export default handler

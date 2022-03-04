import { withSentry } from '@sentry/nextjs'
import { DashboardFolder } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)

  const parentFolderId = req.query.parentId
    ? req.query.parentId.toString()
    : null
  if (req.method === 'GET') {
    const folders = await prisma.dashboardFolder.findMany({
      where: {
        ownerId: user.id,
        parentFolderId,
      },
      orderBy: { createdAt: 'desc' },
    })
    return res.send({ folders })
  }
  if (req.method === 'POST') {
    const data = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as Pick<DashboardFolder, 'parentFolderId'>
    const folder = await prisma.dashboardFolder.create({
      data: { ...data, ownerId: user.id, name: 'New folder' },
    })
    return res.send(folder)
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)

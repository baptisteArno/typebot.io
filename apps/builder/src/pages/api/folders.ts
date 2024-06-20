import { DashboardFolder, WorkspaceRole } from '@sniper.io/prisma'
import prisma from '@sniper.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import {
  badRequest,
  methodNotAllowed,
  notAuthenticated,
} from '@sniper.io/lib/api'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'

// TODO: Delete as it has been migrated to TRPC endpoints
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)

  const parentFolderId = req.query.parentId
    ? req.query.parentId.toString()
    : null

  if (req.method === 'GET') {
    const workspaceId = req.query.workspaceId as string | undefined
    if (!workspaceId) return badRequest(res)
    const folders = await prisma.dashboardFolder.findMany({
      where: {
        AND: [
          {
            parentFolderId,
            workspaceId: workspaceId,
          },
          {
            workspace: {
              members: {
                some: {
                  userId: user.id,
                  role: { not: WorkspaceRole.GUEST },
                },
              },
            },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })
    return res.send({ folders })
  }
  if (req.method === 'POST') {
    const data = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as Pick<DashboardFolder, 'parentFolderId' | 'workspaceId'>
    const folder = await prisma.dashboardFolder.create({
      data: { ...data, name: 'New folder' },
    })
    return res.send(folder)
  }
  return methodNotAllowed(res)
}

export default handler

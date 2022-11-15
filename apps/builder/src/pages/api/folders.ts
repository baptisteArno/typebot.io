import { withSentry } from '@sentry/nextjs'
import { DashboardFolder, WorkspaceRole } from 'db'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { badRequest, methodNotAllowed, notAuthenticated } from 'utils/api'
import { getAuthenticatedUser } from '@/features/auth'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
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
            OR: [
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
              {
                typebots: {
                  some: {
                    collaborators: {
                      some: {
                        userId: user.id,
                      },
                    },
                  },
                },
              },
            ],
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

export default withSentry(handler)

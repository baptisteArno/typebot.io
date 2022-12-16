import { Plan, WorkspaceRole } from 'db'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import {
  badRequest,
  methodNotAllowed,
  notAuthenticated,
  notFound,
} from 'utils/api'
import { getAuthenticatedUser } from '@/features/auth/api'
import { parseNewTypebot } from '@/features/dashboard'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  try {
    if (req.method === 'GET') {
      const workspaceId = req.query.workspaceId as string | undefined
      const folderId = req.query.allFolders
        ? undefined
        : req.query.folderId
        ? req.query.folderId.toString()
        : null
      if (!workspaceId) return badRequest(res)
      const typebotIds = req.query.typebotIds as string[] | undefined
      if (typebotIds) {
        const typebots = await prisma.typebot.findMany({
          where: {
            OR: [
              {
                workspace: { members: { some: { userId: user.id } } },
                id: { in: typebotIds },
                isArchived: { not: true },
              },
              {
                id: { in: typebotIds },
                collaborators: {
                  some: {
                    userId: user.id,
                  },
                },
                isArchived: { not: true },
              },
            ],
          },
          orderBy: { createdAt: 'desc' },
          select: { name: true, id: true, groups: true, variables: true },
        })
        return res.send({ typebots })
      }
      const typebots = await prisma.typebot.findMany({
        where: {
          OR: [
            {
              isArchived: { not: true },
              folderId,
              workspace: {
                id: workspaceId,
                members: {
                  some: {
                    userId: user.id,
                    role: { not: WorkspaceRole.GUEST },
                  },
                },
              },
            },
            {
              isArchived: { not: true },
              workspace: {
                id: workspaceId,
                members: {
                  some: { userId: user.id, role: WorkspaceRole.GUEST },
                },
              },
            },
          ],
        },
        orderBy: { createdAt: 'desc' },
        select: { name: true, publishedTypebotId: true, id: true, icon: true },
      })
      return res.send({ typebots })
    }
    if (req.method === 'POST') {
      const workspace = await prisma.workspace.findFirst({
        where: { id: req.body.workspaceId },
        select: { plan: true },
      })
      if (!workspace) return notFound(res, "Couldn't find workspace")
      const data =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const typebot = await prisma.typebot.create({
        data:
          'groups' in data
            ? data
            : parseNewTypebot({
                ownerAvatarUrl: user.image,
                isBrandingEnabled: workspace.plan === Plan.FREE,
                ...data,
              }),
      })
      return res.send(typebot)
    }
    return methodNotAllowed(res)
  } catch (err) {
    console.error(err)
    if (err instanceof Error) {
      return res.status(500).send({ title: err.name, message: err.message })
    }
    return res.status(500).send({ message: 'An error occured', error: err })
  }
}

export default handler

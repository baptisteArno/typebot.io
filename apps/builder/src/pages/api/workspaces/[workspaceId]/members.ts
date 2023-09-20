import prisma from '@typebot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import {
  methodNotAllowed,
  notAuthenticated,
  notFound,
} from '@typebot.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const id = req.query.workspaceId as string
    const workspace = await prisma.workspace.findFirst({
      where: {
        id,
        members: { some: { userId: user.id } },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        invitations: true,
      },
    })
    if (!workspace) return notFound(res)
    return res.send({
      members: workspace.members.map((member) => ({
        userId: member.userId,
        role: member.role,
        workspaceId: member.workspaceId,
        email: member.user.email,
        image: member.user.image,
        name: member.user.name,
      })),
      invitations: workspace.invitations,
    })
  }
  methodNotAllowed(res)
}

export default handler

import { withSentry } from '@sentry/nextjs'
import { WorkspaceInvitation, WorkspaceRole } from 'db'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/api'
import { methodNotAllowed, notAuthenticated } from 'utils/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'PATCH') {
    const data = req.body as Omit<WorkspaceInvitation, 'createdAt'>
    const invitation = await prisma.workspaceInvitation.updateMany({
      where: {
        id: data.id,
        workspace: {
          members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
        },
      },
      data,
    })
    return res.send({ invitation })
  }
  if (req.method === 'DELETE') {
    const id = req.query.id as string
    await prisma.workspaceInvitation.deleteMany({
      where: {
        id,
        workspace: {
          members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
        },
      },
    })
    return res.send({ message: 'success' })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)

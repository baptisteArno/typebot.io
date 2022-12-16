import { MemberInWorkspace, WorkspaceRole } from 'db'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/api'
import { methodNotAllowed, notAuthenticated } from 'utils/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'PATCH') {
    const workspaceId = req.query.workspaceId as string
    const memberId = req.query.id as string
    const updates = req.body as Partial<MemberInWorkspace>
    const member = await prisma.memberInWorkspace.updateMany({
      where: {
        userId: memberId,
        workspace: {
          id: workspaceId,
          members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
        },
      },
      data: { role: updates.role },
    })
    return res.status(200).json({
      member,
    })
  }
  if (req.method === 'DELETE') {
    const workspaceId = req.query.workspaceId as string
    const memberId = req.query.id as string
    const member = await prisma.memberInWorkspace.deleteMany({
      where: {
        userId: memberId,
        workspace: {
          id: workspaceId,
          members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
        },
      },
    })
    return res.status(200).json({
      member,
    })
  }
  methodNotAllowed(res)
}

export default handler

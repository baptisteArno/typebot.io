import { withSentry } from '@sentry/nextjs'
import { Prisma, Workspace, WorkspaceRole } from 'db'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/api'
import { methodNotAllowed, notAuthenticated } from 'utils/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'PATCH') {
    const id = req.query.workspaceId as string
    const updates = req.body as Partial<Workspace>
    const updatedWorkspace = await prisma.workspace.updateMany({
      where: {
        id,
        members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
      },
      data: updates,
    })
    return res.status(200).json({
      workspace: updatedWorkspace,
    })
  }
  if (req.method === 'DELETE') {
    const id = req.query.workspaceId as string
    const workspaceFilter: Prisma.WorkspaceWhereInput = {
      id,
      members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
    }
    await prisma.workspace.deleteMany({
      where: workspaceFilter,
    })
    return res.status(200).json({
      message: 'success',
    })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)

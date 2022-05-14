import { withSentry } from '@sentry/nextjs'
import { Workspace, WorkspaceRole } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated } from 'utils'

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
  methodNotAllowed(res)
}

export default withSentry(handler)

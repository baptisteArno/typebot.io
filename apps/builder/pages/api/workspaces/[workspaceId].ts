import { withSentry } from '@sentry/nextjs'
import { Workspace, WorkspaceRole } from 'model'
//import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser()
  if (!user) return notAuthenticated(res)
  if (req.method === 'PATCH') {
    const id = req.query.workspaceId as string
    const updates = req.body as Partial<Workspace>
    // const updatedWorkspace = await prisma.workspace.updateMany({
    //   where: {
    //     id,
    //     members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
    //   },
    //   data: updates,
    // })
    const updatedWorkspace = null
    return res.status(200).json({
      workspace: updatedWorkspace,
    })
  }
  if (req.method === 'DELETE') {
    const id = req.query.workspaceId as string
    // await prisma.workspace.deleteMany({
    //   where: {
    //     id,
    //     members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
    //   },
    // })
    return res.status(200).json({
      message: 'success',
    })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)

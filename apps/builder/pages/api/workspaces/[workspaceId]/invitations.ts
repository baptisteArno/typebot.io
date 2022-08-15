import { withSentry } from '@sentry/nextjs'
import { WorkspaceInvitation, WorkspaceRole } from 'model'
//import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { forbidden, methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser()
  if (!user) return notAuthenticated(res)
  if (req.method === 'POST') {
    // const data = req.body as Omit<WorkspaceInvitation, 'id' | 'createdAt'>
    // const existingUser = await prisma.user.findUnique({
    //   where: { email: data.email },
    // })
    // const workspace = await prisma.workspace.findFirst({
    //   where: {
    //     id: data.workspaceId,
    //     members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
    //   },
    // })
    // if (!workspace) return forbidden(res)
    // if (existingUser) {
    //   await prisma.memberInWorkspace.create({
    //     data: {
    //       role: data.type,
    //       workspaceId: data.workspaceId,
    //       userId: existingUser.id,
    //     },
    //   })
    //   return res.send({
    //     member: {
    //       userId: existingUser.id,
    //       name: existingUser.name,
    //       email: existingUser.email,
    //       role: data.type,
    //       workspaceId: data.workspaceId,
    //     },
    //   })
    //}
    //const invitation = await prisma.workspaceInvitation.create({ data })
    const invitation = null
    return res.send({ invitation })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)

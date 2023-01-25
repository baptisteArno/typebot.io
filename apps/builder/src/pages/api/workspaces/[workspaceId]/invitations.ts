import { Workspace, WorkspaceInvitation, WorkspaceRole } from 'db'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { forbidden, methodNotAllowed, notAuthenticated } from 'utils/api'
import { getAuthenticatedUser } from '@/features/auth/api'
import { getSeatsLimit } from 'utils/pricing'
import { sendWorkspaceMemberInvitationEmail } from 'emails'
import { env } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'POST') {
    const data = req.body as Omit<WorkspaceInvitation, 'id' | 'createdAt'>
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: data.workspaceId,
        members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
      },
    })
    if (!workspace) return forbidden(res)

    if (await checkIfSeatsLimitReached(workspace))
      return res.status(400).send('Seats limit reached')
    if (existingUser) {
      await prisma.memberInWorkspace.create({
        data: {
          role: data.type,
          workspaceId: data.workspaceId,
          userId: existingUser.id,
        },
      })
      if (env('E2E_TEST') !== 'true')
        await sendWorkspaceMemberInvitationEmail({
          to: data.email,
          workspaceName: workspace.name,
          guestEmail: data.email,
          url: `${process.env.NEXTAUTH_URL}/typebots?workspaceId=${workspace.id}`,
          hostEmail: user.email ?? '',
        })
      return res.send({
        member: {
          userId: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          role: data.type,
          workspaceId: data.workspaceId,
        },
      })
    } else {
      const invitation = await prisma.workspaceInvitation.create({ data })
      if (env('E2E_TEST') !== 'true')
        await sendWorkspaceMemberInvitationEmail({
          to: data.email,
          workspaceName: workspace.name,
          guestEmail: data.email,
          url: `${process.env.NEXTAUTH_URL}/typebots?workspaceId=${workspace.id}`,
          hostEmail: user.email ?? '',
        })
      return res.send({ invitation })
    }
  }
  methodNotAllowed(res)
}

const checkIfSeatsLimitReached = async (workspace: Workspace) => {
  const existingMembersCount = await prisma.memberInWorkspace.count({
    where: { workspaceId: workspace.id },
  })

  return existingMembersCount >= getSeatsLimit(workspace)
}

export default handler

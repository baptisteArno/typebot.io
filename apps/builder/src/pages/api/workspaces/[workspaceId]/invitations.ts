import { WorkspaceInvitation, WorkspaceRole } from '@typebot.io/prisma'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import {
  forbidden,
  methodNotAllowed,
  notAuthenticated,
} from '@typebot.io/lib/api'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { sendWorkspaceMemberInvitationEmail } from '@typebot.io/emails'
import { env } from '@typebot.io/lib'
import { isSeatsLimitReached } from '@typebot.io/lib/pricing'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
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

    const [existingMembersCount, existingInvitationsCount] =
      await prisma.$transaction([
        prisma.memberInWorkspace.count({
          where: { workspaceId: workspace.id },
        }),
        prisma.workspaceInvitation.count({
          where: { workspaceId: workspace.id },
        }),
      ])
    if (
      isSeatsLimitReached({
        existingMembersCount,
        existingInvitationsCount,
        ...workspace,
      })
    )
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

export default handler

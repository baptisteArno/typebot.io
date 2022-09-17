import { withSentry } from '@sentry/nextjs'
import { workspaceMemberInvitationEmail } from 'assets/emails/workspaceMemberInvitation'
import { Workspace, WorkspaceInvitation, WorkspaceRole } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { sendEmailNotification } from 'utils'
import { getAuthenticatedUser } from 'services/api/utils'
import {
  env,
  forbidden,
  methodNotAllowed,
  notAuthenticated,
  seatsLimit,
} from 'utils'

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
      return res.send({
        member: {
          userId: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          role: data.type,
          workspaceId: data.workspaceId,
        },
      })
    } else await prisma.workspaceInvitation.create({ data })
    if (env('E2E_TEST') !== 'true')
      await sendEmailNotification({
        to: data.email,
        subject: "You've been invited to collaborate 🤝",
        html: workspaceMemberInvitationEmail({
          workspaceName: workspace.name,
          guestEmail: data.email,
          url: `${process.env.NEXTAUTH_URL}/typebots?workspaceId=${workspace.id}`,
          hostEmail: user.email ?? '',
        }),
      })
    return res.send({ message: 'success' })
  }
  methodNotAllowed(res)
}

const checkIfSeatsLimitReached = async (workspace: Workspace) => {
  const existingMembersCount = await prisma.memberInWorkspace.count({
    where: { workspaceId: workspace.id },
  })
  return existingMembersCount >= seatsLimit[workspace.plan].totalIncluded
}

export default withSentry(handler)

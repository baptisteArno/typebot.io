import { withSentry } from '@sentry/nextjs'
import { invitationToCollaborate } from 'assets/emails/invitationToCollaborate'
import { CollaborationType, WorkspaceRole } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { canReadTypebot, canWriteTypebot } from 'services/api/dbRules'
import { sendEmailNotification } from 'services/api/emails'
import { getAuthenticatedUser } from 'services/api/utils'
import {
  badRequest,
  env,
  forbidden,
  methodNotAllowed,
  notAuthenticated,
} from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  const typebotId = req.query.typebotId as string
  if (req.method === 'GET') {
    const invitations = await prisma.invitation.findMany({
      where: { typebotId, typebot: canReadTypebot(typebotId, user) },
    })
    return res.send({
      invitations,
    })
  }
  if (req.method === 'POST') {
    const typebot = await prisma.typebot.findFirst({
      where: canWriteTypebot(typebotId, user),
    })
    if (!typebot || !typebot.workspaceId) return forbidden(res)
    const { email, type } =
      (req.body as
        | { email: string | undefined; type: CollaborationType | undefined }
        | undefined) ?? {}
    if (!email || !type) return badRequest(res)
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    })
    if (existingUser) {
      await prisma.collaboratorsOnTypebots.create({
        data: {
          type,
          typebotId,
          userId: existingUser.id,
        },
      })
      await prisma.memberInWorkspace.upsert({
        where: {
          userId_workspaceId: {
            userId: existingUser.id,
            workspaceId: typebot.workspaceId,
          },
        },
        create: {
          role: WorkspaceRole.GUEST,
          userId: existingUser.id,
          workspaceId: typebot.workspaceId,
        },
        update: {},
      })
    } else
      await prisma.invitation.create({
        data: { email: email.toLowerCase().trim(), type, typebotId },
      })
    if (env('E2E_TEST') !== 'true')
      await sendEmailNotification({
        to: email,
        subject: "You've been invited to collaborate 🤝",
        content: invitationToCollaborate(
          user.email ?? '',
          `${process.env.NEXTAUTH_URL}/typebots?workspaceId=${typebot.workspaceId}`
        ),
      })
    return res.send({
      message: 'success',
    })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)

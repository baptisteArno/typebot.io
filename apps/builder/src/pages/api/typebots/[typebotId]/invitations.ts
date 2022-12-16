import { CollaborationType, WorkspaceRole } from 'db'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { canReadTypebots, canWriteTypebots } from '@/utils/api/dbRules'
import {
  badRequest,
  forbidden,
  methodNotAllowed,
  notAuthenticated,
} from 'utils/api'
import { getAuthenticatedUser } from '@/features/auth/api'
import { env } from 'utils'
import { sendGuestInvitationEmail } from 'emails'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  const typebotId = req.query.typebotId as string
  if (req.method === 'GET') {
    const invitations = await prisma.invitation.findMany({
      where: { typebotId, typebot: canReadTypebots(typebotId, user) },
    })
    return res.send({
      invitations,
    })
  }
  if (req.method === 'POST') {
    const typebot = await prisma.typebot.findFirst({
      where: canWriteTypebots(typebotId, user),
      include: { workspace: { select: { name: true } } },
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
      await sendGuestInvitationEmail({
        to: email,
        hostEmail: user.email ?? '',
        url: `${process.env.NEXTAUTH_URL}/typebots?workspaceId=${typebot.workspaceId}`,
        guestEmail: email.toLowerCase(),
        typebotName: typebot.name,
        workspaceName: typebot.workspace?.name ?? '',
      })
    return res.send({
      message: 'success',
    })
  }
  methodNotAllowed(res)
}

export default handler

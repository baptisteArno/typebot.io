import { CollaborationType, WorkspaceRole } from '@sniper.io/prisma'
import prisma from '@sniper.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import {
  canReadSnipers,
  canWriteSnipers,
  isUniqueConstraintError,
} from '@/helpers/databaseRules'
import {
  badRequest,
  forbidden,
  methodNotAllowed,
  notAuthenticated,
} from '@sniper.io/lib/api'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { sendGuestInvitationEmail } from '@sniper.io/emails'
import { env } from '@sniper.io/env'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  const sniperId = req.query.sniperId as string | undefined
  if (!sniperId) return badRequest(res)
  if (req.method === 'GET') {
    const invitations = await prisma.invitation.findMany({
      where: { sniperId, sniper: canReadSnipers(sniperId, user) },
    })
    return res.send({
      invitations,
    })
  }
  if (req.method === 'POST') {
    const sniper = await prisma.sniper.findFirst({
      where: canWriteSnipers(sniperId, user),
      include: { workspace: { select: { name: true } } },
    })
    if (!sniper || !sniper.workspaceId) return forbidden(res)
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
      try {
        await prisma.collaboratorsOnSnipers.create({
          data: {
            type,
            sniperId,
            userId: existingUser.id,
          },
        })
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          return res.status(400).send({
            message: 'User already has access to this sniper.',
          })
        }
        throw error
      }

      await prisma.memberInWorkspace.upsert({
        where: {
          userId_workspaceId: {
            userId: existingUser.id,
            workspaceId: sniper.workspaceId,
          },
        },
        create: {
          role: WorkspaceRole.GUEST,
          userId: existingUser.id,
          workspaceId: sniper.workspaceId,
        },
        update: {},
      })
    } else
      await prisma.invitation.create({
        data: { email: email.toLowerCase().trim(), type, sniperId },
      })
    if (!env.NEXT_PUBLIC_E2E_TEST)
      await sendGuestInvitationEmail({
        to: email,
        hostEmail: user.email ?? '',
        url: `${env.NEXTAUTH_URL}/snipers?workspaceId=${sniper.workspaceId}`,
        guestEmail: email.toLowerCase(),
        sniperName: sniper.name,
        workspaceName: sniper.workspace?.name ?? '',
      })
    return res.send({
      message: 'success',
    })
  }
  methodNotAllowed(res)
}

export default handler

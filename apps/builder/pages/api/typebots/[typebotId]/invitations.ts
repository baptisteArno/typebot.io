import { withSentry } from '@sentry/nextjs'
import { invitationToCollaborate } from 'assets/emails/invitationToCollaborate'
import { CollaborationType } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { sendEmailNotification } from 'services/api/emails'
import { getAuthenticatedUser } from 'services/api/utils'
import {
  badRequest,
  isNotDefined,
  methodNotAllowed,
  notAuthenticated,
} from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  const typebotId = req.query.typebotId as string
  if (req.method === 'GET') {
    const invitations = await prisma.invitation.findMany({
      where: { typebotId },
    })
    return res.send({
      invitations,
    })
  }
  if (req.method === 'POST') {
    const { email, type } =
      (req.body as
        | { email: string | undefined; type: CollaborationType | undefined }
        | undefined) ?? {}
    if (!email || !type) return badRequest(res)
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    if (existingUser)
      await prisma.collaboratorsOnTypebots.create({
        data: { type, typebotId, userId: existingUser.id },
      })
    else await prisma.invitation.create({ data: { email, type, typebotId } })
    if (isNotDefined(process.env.NEXT_PUBLIC_E2E_TEST))
      await sendEmailNotification({
        to: email,
        subject: "You've been invited to collaborate 🤝",
        content: invitationToCollaborate(
          user.email ?? '',
          `${process.env.NEXTAUTH_URL}/typebots/shared`
        ),
      })
    return res.send({
      message: 'success',
    })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)

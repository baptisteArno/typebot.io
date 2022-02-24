import { withSentry } from '@sentry/nextjs'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  const typebotId = req.query.typebotId as string
  const email = req.query.email as string
  if (req.method === 'PUT') {
    const data = req.body
    await prisma.invitation.upsert({
      where: { email_typebotId: { email, typebotId } },
      create: data,
      update: data,
    })
    return res.send({
      message: 'success',
    })
  }
  if (req.method === 'DELETE') {
    await prisma.invitation.delete({
      where: { email_typebotId: { email, typebotId } },
    })
    return res.send({
      message: 'success',
    })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)

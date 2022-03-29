import { withSentry } from '@sentry/nextjs'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { canWriteTypebot } from 'services/api/dbRules'
import { getAuthenticatedUser } from 'services/api/utils'
import { forbidden, methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  const typebotId = req.query.typebotId as string
  const userId = req.query.userId as string
  const typebot = await prisma.typebot.findFirst({
    where: canWriteTypebot(typebotId, user),
  })
  if (!typebot) return forbidden(res)
  if (req.method === 'PUT') {
    const data = req.body
    await prisma.collaboratorsOnTypebots.upsert({
      where: { userId_typebotId: { typebotId, userId } },
      create: data,
      update: data,
    })
    return res.send({
      message: 'success',
    })
  }
  if (req.method === 'DELETE') {
    await prisma.collaboratorsOnTypebots.delete({
      where: { userId_typebotId: { typebotId, userId } },
    })
    return res.send({
      message: 'success',
    })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)

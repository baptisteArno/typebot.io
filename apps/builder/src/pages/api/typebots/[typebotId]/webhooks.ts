import prisma from '@/lib/prisma'
import { defaultWebhookAttributes } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { canWriteTypebots } from '@/utils/api/dbRules'
import { getAuthenticatedUser } from '@/features/auth/api'
import { forbidden, methodNotAllowed, notAuthenticated } from 'utils/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'POST') {
    const typebotId = req.query.typebotId as string
    const typebot = await prisma.typebot.findFirst({
      where: canWriteTypebots(typebotId, user),
      select: { id: true },
    })
    if (!typebot) return forbidden(res)
    const webhook = await prisma.webhook.create({
      data: { typebotId, ...defaultWebhookAttributes },
    })
    return res.send({ webhook })
  }
  methodNotAllowed(res)
}

export default handler

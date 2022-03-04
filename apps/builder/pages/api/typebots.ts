import { withSentry } from '@sentry/nextjs'
import { Prisma } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { parseNewTypebot } from 'services/typebots/typebots'
import { methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  try {
    if (req.method === 'GET') {
      const folderId = req.query.folderId ? req.query.folderId.toString() : null
      const typebots = await prisma.typebot.findMany({
        where: {
          ownerId: user.id,
          folderId,
        },
        orderBy: { createdAt: 'desc' },
        select: { name: true, publishedTypebotId: true, id: true },
      })
      return res.send({ typebots })
    }
    if (req.method === 'POST') {
      const data =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const typebot = await prisma.typebot.create({
        data:
          'blocks' in data
            ? data
            : (parseNewTypebot({
                ownerId: user.id,
                ...data,
              }) as Prisma.TypebotUncheckedCreateInput),
      })
      return res.send(typebot)
    }
    return methodNotAllowed(res)
  } catch (err) {
    console.error(err)
    if (err instanceof Error) {
      return res.status(500).send({ title: err.name, message: err.message })
    }
    return res.status(500).send({ message: 'An error occured', error: err })
  }
}

export default withSentry(handler)

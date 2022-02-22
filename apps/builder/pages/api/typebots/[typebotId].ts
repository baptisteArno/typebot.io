import { withSentry } from '@sentry/nextjs'
import { User } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { methodNotAllowed } from 'utils'

const adminEmail = 'contact@baptiste-arnaud.fr'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  if (!session?.user)
    return res.status(401).json({ message: 'Not authenticated' })

  const typebotId = req.query.typebotId.toString()
  const user = session.user as User
  if (req.method === 'GET') {
    const typebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
        ownerId: user.email === adminEmail ? undefined : user.id,
      },
      include: {
        publishedTypebot: true,
      },
    })
    if (!typebot) return res.send({ typebot: null })
    const { publishedTypebot, ...restOfTypebot } = typebot
    return res.send({ typebot: restOfTypebot, publishedTypebot })
  }
  if (req.method === 'DELETE') {
    const typebots = await prisma.typebot.delete({
      where: {
        id_ownerId: {
          id: typebotId,
          ownerId: user.id,
        },
      },
    })
    return res.send({ typebots })
  }
  if (req.method === 'PUT') {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const typebots = await prisma.typebot.update({
      where: { id_ownerId: { id: typebotId, ownerId: user.id } },
      data: {
        ...data,
        theme: data.theme ?? undefined,
        settings: data.settings ?? undefined,
      },
    })
    return res.send({ typebots })
  }
  if (req.method === 'PATCH') {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const typebots = await prisma.typebot.update({
      where: { id_ownerId: { id: typebotId, ownerId: user.id } },
      data,
    })
    return res.send({ typebots })
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)

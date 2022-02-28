import { withSentry } from '@sentry/nextjs'
import { CollaborationType, Prisma, User } from 'db'
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
      where: parseWhereFilter(typebotId, user, 'read'),
      include: {
        publishedTypebot: true,
        owner: { select: { email: true, name: true, image: true } },
        collaborators: { select: { userId: true, type: true } },
      },
    })
    if (!typebot) return res.send({ typebot: null })
    const { publishedTypebot, owner, collaborators, ...restOfTypebot } = typebot
    const isReadOnly =
      collaborators.find((c) => c.userId === user.id)?.type ===
      CollaborationType.READ
    return res.send({
      typebot: restOfTypebot,
      publishedTypebot,
      owner,
      isReadOnly,
    })
  }

  const canEditTypebot = parseWhereFilter(typebotId, user, 'write')
  if (req.method === 'DELETE') {
    const typebots = await prisma.typebot.deleteMany({
      where: canEditTypebot,
    })
    return res.send({ typebots })
  }
  if (req.method === 'PUT') {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const typebots = await prisma.typebot.updateMany({
      where: canEditTypebot,
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
    const typebots = await prisma.typebot.updateMany({
      where: canEditTypebot,
      data,
    })
    return res.send({ typebots })
  }
  return methodNotAllowed(res)
}

const parseWhereFilter = (
  typebotId: string,
  user: User,
  type: 'read' | 'write'
): Prisma.TypebotWhereInput => ({
  OR: [
    {
      id: typebotId,
      ownerId:
        (type === 'read' && user.email === adminEmail) ||
        process.env.NEXT_PUBLIC_E2E_TEST
          ? undefined
          : user.id,
    },
    {
      id: typebotId,
      collaborators: {
        some: {
          userId: user.id,
          type:
            type === 'write' ? CollaborationType.WRITE : CollaborationType.READ,
        },
      },
    },
  ],
})

export default withSentry(handler)

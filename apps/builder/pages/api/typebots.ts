import { Typebot, User } from '@typebot/prisma'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { methodNotAllowed } from 'services/api/utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  if (!session?.user)
    return res.status(401).json({ message: 'Not authenticated' })

  const user = session.user as User
  if (req.method === 'GET') {
    const folderId = req.query.folderId ? req.query.folderId.toString() : null
    const typebots = await prisma.typebot.findMany({
      where: {
        ownerId: user.id,
        folderId,
      },
    })
    return res.send({ typebots })
  }
  if (req.method === 'POST') {
    const data = JSON.parse(req.body) as Typebot
    const typebot = await prisma.typebot.create({
      data: { ...data, ownerId: user.id },
    })
    return res.send(typebot)
  }
  return methodNotAllowed(res)
}

export default handler

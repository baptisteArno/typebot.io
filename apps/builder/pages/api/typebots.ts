import { Prisma, User } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { parseNewTypebot } from 'services/typebots'
import { methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  if (!session?.user)
    return res.status(401).json({ message: 'Not authenticated' })

  const user = session.user as User
  try {
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
      const data = JSON.parse(req.body)
      const typebot = await prisma.typebot.create({
        data: parseNewTypebot({
          ownerId: user.id,
          ...data,
        }) as Prisma.TypebotUncheckedCreateInput,
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

export default handler

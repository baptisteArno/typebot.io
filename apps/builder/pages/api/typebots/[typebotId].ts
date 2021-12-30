import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  if (!session?.user)
    return res.status(401).json({ message: 'Not authenticated' })

  const typebotId = req.query.typebotId.toString()
  if (req.method === 'GET') {
    const typebot = await prisma.typebot.findUnique({
      where: { id: typebotId },
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
      where: { id: typebotId },
    })
    return res.send({ typebots })
  }
  if (req.method === 'PUT') {
    const data = JSON.parse(req.body)
    const typebots = await prisma.typebot.update({
      where: { id: typebotId },
      data,
    })
    return res.send({ typebots })
  }
  if (req.method === 'PATCH') {
    const data = JSON.parse(req.body)
    const typebots = await prisma.typebot.update({
      where: { id: typebotId },
      data,
    })
    return res.send({ typebots })
  }
  return methodNotAllowed(res)
}

export default handler

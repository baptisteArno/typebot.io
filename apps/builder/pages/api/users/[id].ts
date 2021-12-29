import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  if (!session?.user)
    return res.status(401).json({ message: 'Not authenticated' })

  const id = req.query.id.toString()
  if (req.method === 'PUT') {
    const data = JSON.parse(req.body)
    const typebots = await prisma.user.update({
      where: { id },
      data,
    })
    return res.send({ typebots })
  }
  return methodNotAllowed(res)
}

export default handler

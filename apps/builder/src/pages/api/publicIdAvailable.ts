import prisma from '@typebot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, notAuthenticated } from '@typebot.io/lib/api'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const publicId = req.query.publicId as string | undefined
    const exists = await prisma.typebot.count({
      where: { publicId: publicId ?? '' },
    })
    return res.send({ isAvailable: Boolean(!exists) })
  }
  return methodNotAllowed(res)
}

export default handler

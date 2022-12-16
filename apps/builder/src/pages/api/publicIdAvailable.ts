import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { badRequest, methodNotAllowed, notAuthenticated } from 'utils/api'
import { getAuthenticatedUser } from '@/features/auth/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const publicId = req.query.publicId as string | undefined
    if (!publicId) return badRequest(res, 'publicId is required')
    const exists = await prisma.typebot.count({ where: { publicId } })
    return res.send({ isAvailable: Boolean(!exists) })
  }
  return methodNotAllowed(res)
}

export default handler

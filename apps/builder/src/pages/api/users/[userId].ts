import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/api'
import { methodNotAllowed, notAuthenticated } from 'utils/api'
import { User } from 'db'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)

  const id = req.query.userId as string
  if (req.method === 'PUT') {
    const data = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as User
    const typebots = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        onboardingCategories: data.onboardingCategories ?? [],
      },
    })
    return res.send({ typebots })
  }
  return methodNotAllowed(res)
}

export default handler

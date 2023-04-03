import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { methodNotAllowed, notAuthenticated } from '@typebot.io/lib/api'
import { User } from '@typebot.io/prisma'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
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

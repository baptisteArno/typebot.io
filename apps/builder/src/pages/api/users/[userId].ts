import prisma from '@sniper.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { methodNotAllowed, notAuthenticated } from '@sniper.io/lib/api'
import { User } from '@sniper.io/schemas'
import { trackEvents } from '@sniper.io/telemetry/trackEvents'
import { Prisma } from '@sniper.io/prisma'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)

  const id = req.query.userId as string
  if (req.method === 'PATCH') {
    const data = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as Partial<User>
    const snipers = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        onboardingCategories: data.onboardingCategories ?? [],
        displayedInAppNotifications:
          data.displayedInAppNotifications ?? Prisma.DbNull,
      },
    })
    if (data.onboardingCategories || data.referral || data.company || data.name)
      await trackEvents([
        {
          name: 'User updated',
          userId: user.id,
          data: {
            name: data.name ?? undefined,
            onboardingCategories: data.onboardingCategories ?? undefined,
            referral: data.referral ?? undefined,
            company: data.company ?? undefined,
          },
        },
      ])
    return res.send({ snipers })
  }
  return methodNotAllowed(res)
}

export default handler

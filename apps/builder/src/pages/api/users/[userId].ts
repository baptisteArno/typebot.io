import prisma from '@typebot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { methodNotAllowed, notAuthenticated } from '@typebot.io/lib/api'
import { User } from '@typebot.io/schemas'
import { trackEvents } from '@typebot.io/telemetry/trackEvents'
import { Prisma } from '@typebot.io/prisma'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)

  const id = req.query.userId as string
  if (req.method === 'PATCH') {
    const data = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as Partial<User>
    const typebots = await prisma.user.update({
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
    return res.send({ typebots })
  }
  return methodNotAllowed(res)
}

export default handler

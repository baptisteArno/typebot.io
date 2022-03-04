import { withSentry } from '@sentry/nextjs'
import { Prisma } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const user = await getAuthenticatedUser(req)
    if (!user) return notAuthenticated(res)
    const { code } =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const coupon = await prisma.coupon.findFirst({
      where: { code, dateRedeemed: null },
    })
    if (!coupon) return res.status(404).send({ message: 'Coupon not found' })
    await prisma.user.update({
      where: { id: user.id },
      data: coupon.userPropertiesToUpdate as Prisma.UserUncheckedUpdateInput,
    })
    await prisma.coupon.update({
      where: { code },
      data: { dateRedeemed: new Date() },
    })
    return res.send({ message: 'Coupon redeemed 🎊' })
  }
}

export default withSentry(handler)

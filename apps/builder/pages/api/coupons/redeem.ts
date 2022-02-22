import { withSentry } from '@sentry/nextjs'
import { Prisma, User } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const session = await getSession({ req })

    if (!session?.user)
      return res.status(401).json({ message: 'Not authenticated' })

    const user = session.user as User
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

import { PrismaClient } from '@typebot.io/prisma'
import { promptAndSetEnvironment } from './utils'
import * as p from '@clack/prompts'

const redeemCoupon = async () => {
  await promptAndSetEnvironment('production')

  const prisma = new PrismaClient()

  const code = await p.text({
    message: 'Coupon code?',
  })

  if (!code || p.isCancel(code)) process.exit()

  const coupon = await prisma.coupon.update({
    where: {
      code,
    },
    data: {
      dateRedeemed: new Date(),
    },
  })

  console.log(coupon)
}

redeemCoupon()

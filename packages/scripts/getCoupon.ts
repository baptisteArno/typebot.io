import { PrismaClient } from '@typebot.io/prisma'
import { promptAndSetEnvironment } from './utils'
import * as p from '@clack/prompts'

const getCoupon = async () => {
  await promptAndSetEnvironment('production')

  const val = (await p.text({
    message: 'Enter coupon code',
  })) as string

  const prisma = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error'],
  })

  const coupon = await prisma.coupon.findFirst({
    where: {
      code: val,
    },
  })

  if (!coupon) {
    console.log('Coupon not found')
    return
  }

  console.log(JSON.stringify(coupon, null, 2))
}

getCoupon()

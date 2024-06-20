import { Plan } from '@sniper.io/prisma'

export const planToReadable = (plan?: Plan) => {
  if (!plan) return
  switch (plan) {
    case Plan.FREE:
      return 'Free'
    case Plan.LIFETIME:
      return 'Lifetime'
    case Plan.OFFERED:
      return 'Offered'
    case Plan.PRO:
      return 'Pro'
    case Plan.UNLIMITED:
      return 'Unlimited'
  }
}

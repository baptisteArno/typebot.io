import { Plan, User } from 'db'
import { loadStripe } from '@stripe/stripe-js/pure'
import { isDefined, isEmpty, sendRequest } from 'utils'

type Props = {
  user: User
  customerId?: string
  currency: 'usd' | 'eur'
  plan: 'pro' | 'team'
  workspaceId: string
}

export const pay = async ({
  customerId,
  ...props
}: Props): Promise<{ newPlan: Plan } | undefined | void> =>
  isDefined(customerId)
    ? updatePlan({ ...props, customerId })
    : redirectToCheckout(props)

const updatePlan = async ({
  customerId,
  plan,
  workspaceId,
  currency,
}: Omit<Props, 'user'>): Promise<{ newPlan: Plan } | undefined> => {
  const { data, error } = await sendRequest<{ message: string }>({
    method: 'POST',
    url: '/api/stripe/update-subscription',
    body: { workspaceId, plan, customerId, currency },
  })
  if (error || !data) return
  return { newPlan: plan === 'team' ? Plan.TEAM : Plan.PRO }
}

const redirectToCheckout = async ({
  user,
  currency,
  plan,
  workspaceId,
}: Omit<Props, 'customerId'>) => {
  if (isEmpty(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY))
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLIC_KEY is missing in env')
  const { data, error } = await sendRequest<{ sessionId: string }>({
    method: 'POST',
    url: '/api/stripe/checkout',
    body: {
      email: user.email,
      currency,
      plan,
      workspaceId,
      href: location.origin + location.pathname,
    },
  })
  if (error || !data) return
  const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)
  await stripe?.redirectToCheckout({
    sessionId: data?.sessionId,
  })
}

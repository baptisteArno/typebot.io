import Stripe from 'stripe'
import { promptAndSetEnvironment } from './utils'

const chatsProductId = 'prod_MVXtq5sATQzIcM'
const proChatTiers = [
  {
    up_to: 'inf',
    unit_amount_decimal: '0.442',
  },
] satisfies Stripe.PriceCreateParams.Tier[]
const starterChatTiers = [
  {
    up_to: 'inf',
    unit_amount: 2,
  },
] satisfies Stripe.PriceCreateParams.Tier[]

const createChatsPrices = async () => {
  await promptAndSetEnvironment()

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2022-11-15',
  })

  await stripe.prices.create({
    currency: 'usd',
    billing_scheme: 'tiered',
    recurring: {
      interval: 'month',
      usage_type: 'metered',
      aggregate_usage: 'last_during_period',
    },
    tiers: starterChatTiers,
    tiers_mode: 'volume',
    tax_behavior: 'exclusive',
    product: chatsProductId,
    currency_options: {
      eur: {
        tax_behavior: 'exclusive',
        tiers: starterChatTiers,
      },
    },
  })

  await stripe.prices.create({
    currency: 'usd',
    billing_scheme: 'tiered',
    recurring: {
      interval: 'month',
      usage_type: 'metered',
      aggregate_usage: 'last_during_period',
    },
    tiers: proChatTiers,
    tiers_mode: 'volume',
    tax_behavior: 'exclusive',
    product: chatsProductId,
    currency_options: {
      eur: {
        tax_behavior: 'exclusive',
        tiers: proChatTiers,
      },
    },
  })
}

createChatsPrices()

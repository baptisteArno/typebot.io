import type { Workspace } from '@typebot.io/prisma'
import { Plan } from '@typebot.io/prisma'

const infinity = -1

export const priceIds = {
  [Plan.STARTER]: {
    base: {
      monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
    },
    chats: {
      monthly: process.env.STRIPE_STARTER_CHATS_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_STARTER_CHATS_YEARLY_PRICE_ID,
    },
    storage: {
      monthly: process.env.STRIPE_STARTER_STORAGE_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_STARTER_STORAGE_YEARLY_PRICE_ID,
    },
  },
  [Plan.PRO]: {
    base: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    },
    chats: {
      monthly: process.env.STRIPE_PRO_CHATS_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_PRO_CHATS_YEARLY_PRICE_ID,
    },
    storage: {
      monthly: process.env.STRIPE_PRO_STORAGE_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_PRO_STORAGE_YEARLY_PRICE_ID,
    },
  },
}

export const prices = {
  [Plan.STARTER]: 39,
  [Plan.PRO]: 89,
} as const

export const chatsLimit = {
  [Plan.FREE]: { totalIncluded: 200 },
  [Plan.STARTER]: {
    graduatedPrice: [
      { totalIncluded: 2000, price: 0 },
      {
        totalIncluded: 2500,
        price: 10,
      },
      {
        totalIncluded: 3000,
        price: 20,
      },
      {
        totalIncluded: 3500,
        price: 30,
      },
    ],
  },
  [Plan.PRO]: {
    graduatedPrice: [
      { totalIncluded: 10000, price: 0 },
      { totalIncluded: 15000, price: 50 },
      { totalIncluded: 25000, price: 150 },
      { totalIncluded: 50000, price: 400 },
    ],
  },
  [Plan.CUSTOM]: {
    totalIncluded: 2000,
    increaseStep: {
      amount: 500,
      price: 10,
    },
  },
  [Plan.OFFERED]: { totalIncluded: infinity },
  [Plan.LIFETIME]: { totalIncluded: infinity },
  [Plan.UNLIMITED]: { totalIncluded: infinity },
} as const

export const storageLimit = {
  [Plan.FREE]: { totalIncluded: 0 },
  [Plan.STARTER]: {
    graduatedPrice: [
      { totalIncluded: 2, price: 0 },
      {
        totalIncluded: 3,
        price: 2,
      },
      {
        totalIncluded: 4,
        price: 4,
      },
      {
        totalIncluded: 5,
        price: 6,
      },
    ],
  },
  [Plan.PRO]: {
    graduatedPrice: [
      { totalIncluded: 10, price: 0 },
      {
        totalIncluded: 15,
        price: 8,
      },
      {
        totalIncluded: 25,
        price: 24,
      },
      {
        totalIncluded: 40,
        price: 49,
      },
    ],
  },
  [Plan.CUSTOM]: {
    totalIncluded: 2,
    increaseStep: {
      amount: 1,
      price: 2,
    },
  },
  [Plan.OFFERED]: { totalIncluded: 2 },
  [Plan.LIFETIME]: { totalIncluded: 10 },
  [Plan.UNLIMITED]: { totalIncluded: infinity },
} as const

export const seatsLimit = {
  [Plan.FREE]: { totalIncluded: 1 },
  [Plan.STARTER]: {
    totalIncluded: 2,
  },
  [Plan.PRO]: {
    totalIncluded: 5,
  },
  [Plan.CUSTOM]: {
    totalIncluded: 2,
  },
  [Plan.OFFERED]: { totalIncluded: 2 },
  [Plan.LIFETIME]: { totalIncluded: 8 },
  [Plan.UNLIMITED]: { totalIncluded: infinity },
} as const

export const getChatsLimit = ({
  plan,
  additionalChatsIndex,
  customChatsLimit,
}: Pick<Workspace, 'additionalChatsIndex' | 'plan' | 'customChatsLimit'>) => {
  if (customChatsLimit) return customChatsLimit
  const totalIncluded =
    plan === Plan.STARTER || plan === Plan.PRO
      ? chatsLimit[plan].graduatedPrice[additionalChatsIndex].totalIncluded
      : chatsLimit[plan].totalIncluded
  return totalIncluded
}

export const getStorageLimit = ({
  plan,
  additionalStorageIndex,
  customStorageLimit,
}: Pick<
  Workspace,
  'additionalStorageIndex' | 'plan' | 'customStorageLimit'
>) => {
  if (customStorageLimit) return customStorageLimit
  const totalIncluded =
    plan === Plan.STARTER || plan === Plan.PRO
      ? storageLimit[plan].graduatedPrice[additionalStorageIndex].totalIncluded
      : storageLimit[plan].totalIncluded
  return totalIncluded
}

export const getSeatsLimit = ({
  plan,
  customSeatsLimit,
}: Pick<Workspace, 'plan' | 'customSeatsLimit'>) => {
  if (customSeatsLimit) return customSeatsLimit
  return seatsLimit[plan].totalIncluded
}

export const isSeatsLimitReached = ({
  existingMembersCount,
  existingInvitationsCount,
  plan,
  customSeatsLimit,
}: { existingMembersCount: number; existingInvitationsCount: number } & Pick<
  Workspace,
  'plan' | 'customSeatsLimit'
>) => {
  const seatsLimit = getSeatsLimit({ plan, customSeatsLimit })
  return (
    seatsLimit !== infinity &&
    seatsLimit <= existingMembersCount + existingInvitationsCount
  )
}

export const computePrice = (
  plan: Plan,
  selectedTotalChatsIndex: number,
  selectedTotalStorageIndex: number,
  frequency: 'monthly' | 'yearly'
) => {
  if (plan !== Plan.STARTER && plan !== Plan.PRO) return
  const price =
    prices[plan] +
    chatsLimit[plan].graduatedPrice[selectedTotalChatsIndex].price +
    storageLimit[plan].graduatedPrice[selectedTotalStorageIndex].price
  return frequency === 'monthly' ? price : price - price * 0.16
}

const europeanUnionCountryCodes = [
  'AT',
  'BE',
  'BG',
  'CY',
  'CZ',
  'DE',
  'DK',
  'EE',
  'ES',
  'FI',
  'FR',
  'GR',
  'HR',
  'HU',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SE',
  'SI',
  'SK',
]

const europeanUnionExclusiveLanguageCodes = [
  'fr',
  'de',
  'it',
  'el',
  'pl',
  'fi',
  'nl',
  'hr',
  'cs',
  'hu',
  'ro',
  'sl',
  'sv',
  'bg',
]

export const guessIfUserIsEuropean = () => {
  if (typeof window === 'undefined') return false
  return window.navigator.languages.some((language) => {
    const [languageCode, countryCode] = language.split('-')
    return countryCode
      ? europeanUnionCountryCodes.includes(countryCode)
      : europeanUnionExclusiveLanguageCodes.includes(languageCode)
  })
}

export const formatPrice = (price: number, currency?: 'eur' | 'usd') => {
  const isEuropean = guessIfUserIsEuropean()
  const formatter = new Intl.NumberFormat(isEuropean ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: currency?.toUpperCase() ?? (isEuropean ? 'EUR' : 'USD'),
    maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  })
  return formatter.format(price)
}

import { Plan, Workspace } from 'db'

const infinity = -1

export const prices = {
  [Plan.STARTER]: 39,
  [Plan.PRO]: 89,
} as const

export const chatsLimit = {
  [Plan.FREE]: { totalIncluded: 300 },
  [Plan.STARTER]: {
    totalIncluded: 2000,
    increaseStep: {
      amount: 500,
      price: 10,
    },
  },
  [Plan.PRO]: {
    totalIncluded: 10000,
    increaseStep: {
      amount: 1000,
      price: 10,
    },
  },
  [Plan.OFFERED]: { totalIncluded: infinity },
  [Plan.LIFETIME]: { totalIncluded: infinity },
} as const

export const storageLimit = {
  [Plan.FREE]: { totalIncluded: 0 },
  [Plan.STARTER]: {
    totalIncluded: 2,
    increaseStep: {
      amount: 1,
      price: 2,
    },
  },
  [Plan.PRO]: {
    totalIncluded: 10,
    increaseStep: {
      amount: 1,
      price: 2,
    },
  },
  [Plan.OFFERED]: { totalIncluded: 2 },
  [Plan.LIFETIME]: { totalIncluded: 10 },
} as const

export const seatsLimit = {
  [Plan.FREE]: { totalIncluded: 0 },
  [Plan.STARTER]: {
    totalIncluded: 2,
  },
  [Plan.PRO]: {
    totalIncluded: 5,
  },
  [Plan.OFFERED]: { totalIncluded: 2 },
  [Plan.LIFETIME]: { totalIncluded: 8 },
} as const

export const getChatsLimit = ({
  plan,
  additionalChatsIndex,
}: Pick<Workspace, 'additionalChatsIndex' | 'plan'>) => {
  const { totalIncluded } = chatsLimit[plan]
  const increaseStep =
    plan === Plan.STARTER || plan === Plan.PRO
      ? chatsLimit[plan].increaseStep
      : { amount: 0 }
  if (totalIncluded === infinity) return infinity
  return totalIncluded + increaseStep.amount * additionalChatsIndex
}

export const getStorageLimit = ({
  plan,
  additionalStorageIndex,
}: Pick<Workspace, 'additionalStorageIndex' | 'plan'>) => {
  const { totalIncluded } = storageLimit[plan]
  const increaseStep =
    plan === Plan.STARTER || plan === Plan.PRO
      ? storageLimit[plan].increaseStep
      : { amount: 0 }
  return totalIncluded + increaseStep.amount * additionalStorageIndex
}

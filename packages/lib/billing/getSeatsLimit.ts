import { Workspace } from '@typebot.io/schemas'
import { seatsLimits } from './constants'
import { Plan } from '@typebot.io/prisma'

export const getSeatsLimit = ({
  plan,
  customSeatsLimit,
}: Pick<Workspace, 'plan' | 'customSeatsLimit'>) => {
  if (plan === Plan.UNLIMITED) return -1
  if (plan === Plan.CUSTOM) return customSeatsLimit ? customSeatsLimit : -1
  return seatsLimits[plan]
}

import { Plan } from '@typebot.io/prisma'
import { chatsLimits } from './constants'
import { Workspace } from '@typebot.io/schemas'

export const getChatsLimit = ({
  plan,
  customChatsLimit,
}: Pick<Workspace, 'plan'> & {
  customChatsLimit?: Workspace['customChatsLimit']
}) => {
  if (
    plan === Plan.UNLIMITED ||
    plan === Plan.LIFETIME ||
    plan === Plan.OFFERED
  )
    return -1
  if (plan === Plan.CUSTOM) return customChatsLimit ?? -1
  return chatsLimits[plan]
}

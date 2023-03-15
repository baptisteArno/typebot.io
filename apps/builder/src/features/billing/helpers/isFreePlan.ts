import { isNotDefined } from '@typebot.io/lib'
import { Workspace, Plan } from '@typebot.io/prisma'

export const isFreePlan = (workspace?: Pick<Workspace, 'plan'>) =>
  isNotDefined(workspace) || workspace?.plan === Plan.FREE

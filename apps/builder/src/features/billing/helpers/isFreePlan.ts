import { isNotDefined } from '@sniper.io/lib'
import { Workspace, Plan } from '@sniper.io/prisma'

export const isFreePlan = (workspace?: Pick<Workspace, 'plan'>) =>
  isNotDefined(workspace) || workspace?.plan === Plan.FREE

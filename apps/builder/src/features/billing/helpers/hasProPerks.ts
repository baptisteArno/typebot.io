import { isDefined } from '@typebot.io/lib'
import { Workspace, Plan } from '@typebot.io/prisma'

export const hasProPerks = (workspace?: Pick<Workspace, 'plan'>) =>
  isDefined(workspace) &&
  (workspace.plan === Plan.PRO ||
    workspace.plan === Plan.LIFETIME ||
    workspace.plan === Plan.CUSTOM ||
    workspace.plan === Plan.UNLIMITED)

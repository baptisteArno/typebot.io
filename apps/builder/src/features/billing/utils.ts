import { Plan, Workspace } from 'db'
import { isDefined, isNotDefined } from 'utils'

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

export const isFreePlan = (workspace?: Pick<Workspace, 'plan'>) =>
  isNotDefined(workspace) || workspace?.plan === Plan.FREE

export const isProPlan = (workspace?: Pick<Workspace, 'plan'>) =>
  isDefined(workspace) &&
  (workspace.plan === Plan.PRO ||
    workspace.plan === Plan.LIFETIME ||
    workspace.plan === Plan.CUSTOM ||
    workspace.plan === Plan.UNLIMITED)

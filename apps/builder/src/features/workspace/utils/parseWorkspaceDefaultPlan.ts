import { Plan } from 'db'

export const parseWorkspaceDefaultPlan = (userEmail: string) => {
  if (process.env.ADMIN_EMAIL === userEmail) return Plan.LIFETIME
  const defaultPlan = process.env.DEFAULT_WORKSPACE_PLAN as Plan | undefined
  if (defaultPlan && Object.values(Plan).includes(defaultPlan))
    return defaultPlan
  return Plan.FREE
}

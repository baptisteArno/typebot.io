import { Plan } from 'db'
import { seatsLimit } from 'utils'

export function checkCanInviteMember({
  plan,
  currentMembersCount,
}: {
  plan: string | undefined
  currentMembersCount?: number
}) {
  if (!plan || !currentMembersCount) return false
  if (plan !== Plan.STARTER && plan !== Plan.PRO) return false

  return seatsLimit[plan].totalIncluded > currentMembersCount
}

import { Plan } from 'db'
import { seatsLimit } from 'utils'

export function checkCanInviteMember({
  plan,
  currentMembersCount,
}: {
  plan?: Plan
  currentMembersCount?: number
}) {
  if (!plan || !currentMembersCount) return false

  return seatsLimit[plan].totalIncluded > currentMembersCount
}

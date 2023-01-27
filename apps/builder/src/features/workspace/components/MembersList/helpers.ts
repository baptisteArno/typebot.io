import { Plan } from 'db'
import { getSeatsLimit } from 'utils/pricing'

export function checkCanInviteMember({
  plan,
  customSeatsLimit,
  currentMembersCount,
}: {
  plan?: Plan
  customSeatsLimit?: number | null
  currentMembersCount?: number
}) {
  if (!plan || !currentMembersCount) return false

  const seatsLimit = getSeatsLimit({
    plan,
    customSeatsLimit: customSeatsLimit ?? null,
  })

  if (seatsLimit === -1) return true

  return seatsLimit > currentMembersCount
}

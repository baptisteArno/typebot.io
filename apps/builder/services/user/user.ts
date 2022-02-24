import { Plan, User } from 'db'
import { isNotDefined, sendRequest } from 'utils'

export const updateUser = async (id: string, user: User) =>
  sendRequest({
    url: `/api/users/${id}`,
    method: 'PUT',
    body: user,
  })

export const isFreePlan = (user?: User) =>
  isNotDefined(user) || user?.plan === Plan.FREE

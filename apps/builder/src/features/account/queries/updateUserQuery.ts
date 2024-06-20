import { sendRequest } from '@sniper.io/lib'
import { User } from '@sniper.io/schemas'

export const updateUserQuery = async (id: string, user: Partial<User>) =>
  sendRequest({
    url: `/api/users/${id}`,
    method: 'PATCH',
    body: user,
  })

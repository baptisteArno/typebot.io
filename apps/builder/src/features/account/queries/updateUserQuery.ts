import { sendRequest } from '@typebot.io/lib'
import { User } from '@typebot.io/schemas'

export const updateUserQuery = async (id: string, user: Partial<User>) =>
  sendRequest({
    url: `/api/users/${id}`,
    method: 'PATCH',
    body: user,
  })

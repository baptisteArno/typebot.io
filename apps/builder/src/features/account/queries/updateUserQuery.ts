import { User } from '@typebot.io/prisma'
import { sendRequest } from '@typebot.io/lib'

export const updateUserQuery = async (id: string, user: User) =>
  sendRequest({
    url: `/api/users/${id}`,
    method: 'PUT',
    body: user,
  })

import { User } from 'db'
import { sendRequest } from 'utils'

export const updateUser = async (id: string, user: User) =>
  sendRequest({
    url: `/api/users/${id}`,
    method: 'PUT',
    body: user,
  })

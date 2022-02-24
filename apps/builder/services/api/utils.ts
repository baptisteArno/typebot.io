import { User } from 'db'
import { NextApiRequest } from 'next'
import { getSession } from 'next-auth/react'

export const getAuthenticatedUser = async (
  req: NextApiRequest
): Promise<User | undefined> => {
  const session = await getSession({ req })
  if (session?.user && !('id' in session.user)) return
  return session?.user as User
}

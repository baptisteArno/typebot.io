import { User } from 'db'
import { NextApiRequest } from 'next'
import { getSession } from 'next-auth/react'

export const getAuthenticatedUser = async (
  req: NextApiRequest
): Promise<User | undefined> => {
  const session = await getSession({ req })
  return session?.user as User | undefined
}

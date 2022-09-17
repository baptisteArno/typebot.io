import { setUser } from '@sentry/nextjs'
import { User } from 'db'
import { NextApiRequest } from 'next'
import { getSession } from 'next-auth/react'

export const mockedUser: User = {
  id: 'userId',
  name: 'John Doe',
  email: 'user@email.com',
  company: null,
  createdAt: new Date(),
  emailVerified: null,
  graphNavigation: 'TRACKPAD',
  image: 'https://avatars.githubusercontent.com/u/16015833?v=4',
  lastActivityAt: new Date(),
  onboardingCategories: [],
  updatedAt: new Date(),
}

export const getAuthenticatedUser = async (
  req: NextApiRequest
): Promise<User | undefined> => {
  const session = await getSession({ req })
  if (!session?.user || !('id' in session.user)) return
  const user = session.user as User
  setUser({ id: user.id, email: user.email ?? undefined })
  return session?.user as User
}

//import cuid from 'cuid'
import { GraphNavigation, User } from 'model'
import { NextApiRequest } from 'next'

export const getAuthenticatedUser = (): Omit<User, "emailVerified" | "image" | "apiToken" | "company" | "onboardingCategories"> 
  | undefined => {
  // const session = await getSession({ req })
  // if (!session?.user || !('id' in session.user)) return
  // return session?.user as User

  return {
    id: 'cl58nn2y800007yvte9lq7dh4',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivityAt: new Date(),
    name: 'Typebotter',
    email: 'bot-builder@octadesk.com',
    graphNavigation: GraphNavigation.MOUSE
  }
}

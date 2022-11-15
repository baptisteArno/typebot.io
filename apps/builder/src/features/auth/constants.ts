import { User } from 'db'

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

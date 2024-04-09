import { User } from '@typebot.io/prisma'

export const mockedUser: User = {
  id: 'userId',
  name: 'John Doe',
  email: 'user@email.com',
  company: null,
  createdAt: new Date('2022-01-01'),
  emailVerified: null,
  graphNavigation: 'TRACKPAD',
  preferredAppAppearance: null,
  image: 'https://avatars.githubusercontent.com/u/16015833?v=4',
  lastActivityAt: new Date('2022-01-01'),
  onboardingCategories: [],
  updatedAt: new Date('2022-01-01'),
  displayedInAppNotifications: {
    ['graphGestureNotification']: true,
  },
  referral: null,
}

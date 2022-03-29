import { CollaborationType, Prisma, User } from 'db'

const parseWhereFilter = (
  typebotId: string,
  user: User,
  type: 'read' | 'write'
): Prisma.TypebotWhereInput => ({
  OR: [
    {
      id: typebotId,
      ownerId:
        (type === 'read' && user.email === process.env.ADMIN_EMAIL) ||
        process.env.NEXT_PUBLIC_E2E_TEST
          ? undefined
          : user.id,
    },
    {
      id: typebotId,
      collaborators: {
        some: {
          userId: user.id,
          type: type === 'write' ? CollaborationType.WRITE : undefined,
        },
      },
    },
  ],
})

export const canReadTypebot = (typebotId: string, user: User) =>
  parseWhereFilter(typebotId, user, 'read')

export const canWriteTypebot = (typebotId: string, user: User) =>
  parseWhereFilter(typebotId, user, 'write')

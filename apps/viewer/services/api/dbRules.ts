import { CollaborationType, Prisma, User } from 'db'

const parseWhereFilter = (
  typebotIds: string[] | string,
  user: User,
  type: 'read' | 'write'
): Prisma.TypebotWhereInput => ({
  OR: [
    {
      id: typeof typebotIds === 'string' ? typebotIds : { in: typebotIds },
      ownerId:
        (type === 'read' && user.email === process.env.ADMIN_EMAIL) ||
        process.env.NEXT_PUBLIC_E2E_TEST
          ? undefined
          : user.id,
    },
    {
      id: typeof typebotIds === 'string' ? typebotIds : { in: typebotIds },
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

export const canReadTypebots = (typebotIds: string[], user: User) =>
  parseWhereFilter(typebotIds, user, 'read')

export const canWriteTypebots = (typebotIds: string[], user: User) =>
  parseWhereFilter(typebotIds, user, 'write')

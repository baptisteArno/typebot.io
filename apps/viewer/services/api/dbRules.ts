import { CollaborationType, User, WorkspaceRole } from 'db'
import { isNotEmpty } from 'utils'

// const parseWhereFilter = (
//   typebotIds: string[] | string,
//   user: User,
//   type: 'read' | 'write'
// ): Prisma.TypebotWhereInput => ({
//   OR: [
//     {
//       id: typeof typebotIds === 'string' ? typebotIds : { in: typebotIds },
//       collaborators: {
//         some: {
//           userId: user.id,
//           type: type === 'write' ? CollaborationType.WRITE : undefined,
//         },
//       },
//     },
//     {
//       id: typeof typebotIds === 'string' ? typebotIds : { in: typebotIds },
//       workspace:
//         (type === 'read' && user.email === process.env.ADMIN_EMAIL) ||
//         isNotEmpty(process.env.NEXT_PUBLIC_E2E_TEST)
//           ? undefined
//           : {
//               members: {
//                 some: { userId: user.id, role: { not: WorkspaceRole.GUEST } },
//               },
//             },
//     },
//   ],
// })

export const canReadTypebot = (typebotId: string, user: User) => true
  //parseWhereFilter(typebotId, user, 'read')

export const canWriteTypebot = (typebotId: string, user: User) => true
  //parseWhereFilter(typebotId, user, 'write')

export const canReadTypebots = (typebotIds: string[], user: User) => true
  //parseWhereFilter(typebotIds, user, 'read')

export const canWriteTypebots = (typebotIds: string[], user: User) => true
  //parseWhereFilter(typebotIds, user, 'write')

export const canEditGuests = (user: User, typebotId: string) => true
//  ({
//   id: typebotId,
//   workspace: {
//     members: {
//       some: { userId: user.id, role: { not: WorkspaceRole.GUEST } },
//     },
//   },
// })

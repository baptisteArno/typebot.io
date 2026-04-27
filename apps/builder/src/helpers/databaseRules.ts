import {
  CollaborationType,
  Prisma,
  User,
  WorkspaceRole,
} from '@typebot.io/prisma'
import { env } from '@typebot.io/env'
import {
  getCognitoAccessibleWorkspaceIds,
  type CognitoUserClaims,
} from '@/features/workspace/helpers/cognitoUtils'

const workspaceMemberFilter = (
  user: Pick<User, 'email' | 'id'> & { cognitoClaims?: CognitoUserClaims },
  roleFilter?: Prisma.MemberInWorkspaceWhereInput
): Prisma.WorkspaceWhereInput => {
  const cognitoAccess = getCognitoAccessibleWorkspaceIds(user)

  switch (cognitoAccess.type) {
    case 'admin':
      return {}
    case 'restricted':
      return {
        OR: [
          { members: { some: { userId: user.id, ...roleFilter } } },
          { id: { in: cognitoAccess.ids } },
        ],
      }
    case 'none':
      return { members: { some: { userId: user.id, ...roleFilter } } }
  }
}

export const canWriteTypebots = (
  typebotIds: string[] | string,
  user: Pick<User, 'email' | 'id'> & { cognitoClaims?: CognitoUserClaims }
): Prisma.TypebotWhereInput =>
  env.NEXT_PUBLIC_E2E_TEST
    ? { id: typeof typebotIds === 'string' ? typebotIds : { in: typebotIds } }
    : {
        id: typeof typebotIds === 'string' ? typebotIds : { in: typebotIds },
        OR: [
          {
            workspace: workspaceMemberFilter(user, {
              role: { not: WorkspaceRole.GUEST },
            }),
          },
          {
            collaborators: {
              some: { userId: user.id, type: { not: CollaborationType.READ } },
            },
          },
        ],
      }

export const canReadTypebots = (
  typebotIds: string | string[],
  user: Pick<User, 'email' | 'id'> & { cognitoClaims?: CognitoUserClaims }
) => ({
  id: typeof typebotIds === 'string' ? typebotIds : { in: typebotIds },
  workspace:
    env.ADMIN_EMAIL?.some((email) => email === user.email) ||
    env.NEXT_PUBLIC_E2E_TEST
      ? undefined
      : workspaceMemberFilter(user),
})

export const canEditGuests = (user: User, typebotId: string) => ({
  id: typebotId,
  workspace: {
    members: {
      some: { userId: user.id, role: { not: WorkspaceRole.GUEST } },
    },
  },
})

export const isUniqueConstraintError = (error: unknown) =>
  typeof error === 'object' &&
  error &&
  'code' in error &&
  error.code === 'P2002'

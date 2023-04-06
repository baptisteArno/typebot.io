// Forked from https://github.com/nextauthjs/adapters/blob/main/packages/prisma/src/index.ts
import {
  PrismaClient,
  Prisma,
  WorkspaceRole,
  Session,
} from '@typebot.io/prisma'
import type { Adapter, AdapterUser } from 'next-auth/adapters'
import { createId } from '@paralleldrive/cuid2'
import { generateId } from '@typebot.io/lib'
import { sendTelemetryEvents } from '@typebot.io/lib/telemetry/sendTelemetryEvent'
import { TelemetryEvent } from '@typebot.io/schemas/features/telemetry'
import { convertInvitationsToCollaborations } from '@/features/auth/helpers/convertInvitationsToCollaborations'
import { getNewUserInvitations } from '@/features/auth/helpers/getNewUserInvitations'
import { joinWorkspaces } from '@/features/auth/helpers/joinWorkspaces'
import { parseWorkspaceDefaultPlan } from '@/features/workspace/helpers/parseWorkspaceDefaultPlan'

export function customAdapter(p: PrismaClient): Adapter {
  return {
    createUser: async (data: Omit<AdapterUser, 'id'>) => {
      if (!data.email)
        throw Error('Provider did not forward email but it is required')
      const user = { id: createId(), email: data.email as string }
      const { invitations, workspaceInvitations } = await getNewUserInvitations(
        p,
        user.email
      )
      if (
        process.env.DISABLE_SIGNUP === 'true' &&
        process.env.ADMIN_EMAIL !== user.email &&
        invitations.length === 0 &&
        workspaceInvitations.length === 0
      )
        throw Error('New users are forbidden')

      const newWorkspaceData = {
        name: data.name ? `${data.name}'s workspace` : `My workspace`,
        plan: parseWorkspaceDefaultPlan(data.email),
      }
      const createdUser = await p.user.create({
        data: {
          ...data,
          id: user.id,
          apiTokens: {
            create: { name: 'Default', token: generateId(24) },
          },
          workspaces:
            workspaceInvitations.length > 0
              ? undefined
              : {
                  create: {
                    role: WorkspaceRole.ADMIN,
                    workspace: {
                      create: newWorkspaceData,
                    },
                  },
                },
          onboardingCategories: [],
        },
        include: {
          workspaces: { select: { workspaceId: true } },
        },
      })
      const newWorkspaceId = createdUser.workspaces.pop()?.workspaceId
      const events: TelemetryEvent[] = []
      if (newWorkspaceId) {
        events.push({
          name: 'Workspace created',
          workspaceId: newWorkspaceId,
          userId: createdUser.id,
          data: newWorkspaceData,
        })
      }
      events.push({
        name: 'User created',
        userId: createdUser.id,
        data: {
          email: data.email,
          name: data.name ? (data.name as string).split(' ')[0] : undefined,
        },
      })
      await sendTelemetryEvents(events)
      if (invitations.length > 0)
        await convertInvitationsToCollaborations(p, user, invitations)
      if (workspaceInvitations.length > 0)
        await joinWorkspaces(p, user, workspaceInvitations)
      return createdUser as AdapterUser
    },
    getUser: async (id) =>
      (await p.user.findUnique({ where: { id } })) as AdapterUser,
    getUserByEmail: async (email) =>
      (await p.user.findUnique({ where: { email } })) as AdapterUser,
    async getUserByAccount(provider_providerAccountId) {
      const account = await p.account.findUnique({
        where: { provider_providerAccountId },
        select: { user: true },
      })
      return (account?.user ?? null) as AdapterUser | null
    },
    updateUser: async (data) =>
      (await p.user.update({ where: { id: data.id }, data })) as AdapterUser,
    deleteUser: async (id) =>
      (await p.user.delete({ where: { id } })) as AdapterUser,
    linkAccount: async (data) => {
      await p.account.create({
        data: {
          userId: data.userId,
          type: data.type,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          refresh_token: data.refresh_token,
          access_token: data.access_token,
          expires_at: data.expires_at,
          token_type: data.token_type,
          scope: data.scope,
          id_token: data.id_token,
          session_state: data.session_state,
          oauth_token_secret: data.oauth_token_secret as string,
          oauth_token: data.oauth_token as string,
          refresh_token_expires_in: data.refresh_token_expires_in as number,
        },
      })
    },
    unlinkAccount: async (provider_providerAccountId) => {
      await p.account.delete({ where: { provider_providerAccountId } })
    },
    async getSessionAndUser(sessionToken) {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      })
      if (!userAndSession) return null
      const { user, ...session } = userAndSession
      return { user, session } as { user: AdapterUser; session: Session }
    },
    createSession: (data) => p.session.create({ data }),
    updateSession: (data) =>
      p.session.update({ data, where: { sessionToken: data.sessionToken } }),
    deleteSession: (sessionToken) =>
      p.session.delete({ where: { sessionToken } }),
    createVerificationToken: (data) => p.verificationToken.create({ data }),
    async useVerificationToken(identifier_token) {
      try {
        return await p.verificationToken.delete({ where: { identifier_token } })
      } catch (error) {
        if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025')
          return null
        throw error
      }
    },
  }
}

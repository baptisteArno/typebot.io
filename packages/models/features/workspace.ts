import { z } from 'zod'
import { schemaForType } from './utils'
import {
  Workspace as WorkspacePrisma,
  Plan,
  MemberInWorkspace as MemberInWorkspacePrisma,
  WorkspaceRole,
  User as UserPrisma,
  WorkspaceInvitation as WorkspaceInvitationPrisma,
} from 'db'

export const workspaceMemberSchema = schemaForType<
  Omit<MemberInWorkspacePrisma, 'userId' | 'createdAt' | 'updatedAt'> & {
    user: Pick<UserPrisma, 'name' | 'email' | 'image'>
  }
>()(
  z.object({
    workspaceId: z.string(),
    user: z.object({
      name: z.string().nullable(),
      email: z.string().nullable(),
      image: z.string().nullable(),
    }),
    role: z.nativeEnum(WorkspaceRole),
  })
)

export const workspaceInvitationSchema = schemaForType<
  Omit<WorkspaceInvitationPrisma, 'workspaceId' | 'userId' | 'id'>
>()(
  z.object({
    createdAt: z.date(),
    updatedAt: z.date(),
    email: z.string(),
    type: z.nativeEnum(WorkspaceRole),
  })
)

export const workspaceSchema = schemaForType<WorkspacePrisma>()(
  z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    name: z.string(),
    icon: z.string().nullable(),
    plan: z.nativeEnum(Plan),
    stripeId: z.string().nullable(),
    additionalChatsIndex: z.number(),
    additionalStorageIndex: z.number(),
    chatsLimitFirstEmailSentAt: z.date().nullable(),
    chatsLimitSecondEmailSentAt: z.date().nullable(),
    storageLimitFirstEmailSentAt: z.date().nullable(),
    storageLimitSecondEmailSentAt: z.date().nullable(),
    customChatsLimit: z.number().nullable(),
    customStorageLimit: z.number().nullable(),
    customSeatsLimit: z.number().nullable(),
  })
)

export type Workspace = z.infer<typeof workspaceSchema>
export type WorkspaceMember = z.infer<typeof workspaceMemberSchema>
export type WorkspaceInvitation = z.infer<typeof workspaceInvitationSchema>

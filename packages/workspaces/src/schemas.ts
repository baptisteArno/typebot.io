import { Plan, WorkspaceRole } from "@typebot.io/prisma/enum";
import type { Prisma } from "@typebot.io/prisma/types";
import { z } from "@typebot.io/zod";

export const workspaceMemberSchema = z.object({
  workspaceId: z.string(),
  user: z.object({
    name: z.string().nullable(),
    email: z.string().nullable(),
    image: z.string().nullable(),
  }),
  role: z.nativeEnum(WorkspaceRole),
}) satisfies z.ZodType<
  Omit<Prisma.MemberInWorkspace, "userId" | "createdAt" | "updatedAt"> & {
    user: Pick<Prisma.User, "name" | "email" | "image">;
  }
>;

export const workspaceInvitationSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  email: z.string(),
  type: z.nativeEnum(WorkspaceRole),
}) satisfies z.ZodType<
  Omit<Prisma.WorkspaceInvitation, "workspaceId" | "userId" | "id">
>;

export const workspaceSchema = z.object({
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
  isQuarantined: z.boolean(),
  isSuspended: z.boolean(),
  isPastDue: z.boolean(),
  isVerified: z.boolean().nullable(),
}) satisfies z.ZodType<Prisma.Workspace>;

export type Workspace = z.infer<typeof workspaceSchema>;
export type WorkspaceMember = z.infer<typeof workspaceMemberSchema>;
export type WorkspaceInvitation = z.infer<typeof workspaceInvitationSchema>;

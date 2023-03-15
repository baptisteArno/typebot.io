import {
  Plan,
  Prisma,
  PrismaClient,
  User,
  Workspace,
  WorkspaceRole,
} from '@typebot.io/prisma'
import { createId } from '@paralleldrive/cuid2'
import { Typebot, Webhook } from '@typebot.io/schemas'
import { readFileSync } from 'fs'
import { proWorkspaceId, userId } from './databaseSetup'
import {
  parseTestTypebot,
  parseTypebotToPublicTypebot,
} from './databaseHelpers'

const prisma = new PrismaClient()

type CreateFakeResultsProps = {
  typebotId: string
  count: number
  customResultIdPrefix?: string
  isChronological?: boolean
  fakeStorage?: number
}

export const injectFakeResults = async ({
  count,
  customResultIdPrefix,
  typebotId,
  isChronological,
  fakeStorage,
}: CreateFakeResultsProps) => {
  const resultIdPrefix = customResultIdPrefix ?? createId()
  await prisma.result.createMany({
    data: [
      ...Array.from(Array(count)).map((_, idx) => {
        const today = new Date()
        const rand = Math.random()
        return {
          id: `${resultIdPrefix}-result${idx}`,
          typebotId,
          createdAt: isChronological
            ? new Date(
                today.setTime(today.getTime() + 1000 * 60 * 60 * 24 * idx)
              )
            : new Date(),
          isCompleted: rand > 0.5,
          hasStarted: true,
          variables: [],
        } satisfies Prisma.ResultCreateManyInput
      }),
    ],
  })
  return createAnswers({ fakeStorage, resultIdPrefix, count })
}

const createAnswers = ({
  count,
  resultIdPrefix,
  fakeStorage,
}: { resultIdPrefix: string } & Pick<
  CreateFakeResultsProps,
  'fakeStorage' | 'count'
>) => {
  return prisma.answer.createMany({
    data: [
      ...Array.from(Array(count)).map((_, idx) => ({
        resultId: `${resultIdPrefix}-result${idx}`,
        content: `content${idx}`,
        blockId: 'block1',
        groupId: 'group1',
        storageUsed: fakeStorage ? Math.round(fakeStorage / count) : null,
      })),
    ],
  })
}

export const importTypebotInDatabase = async (
  path: string,
  updates?: Partial<Typebot>
) => {
  const typebot: Typebot = {
    ...JSON.parse(readFileSync(path).toString()),
    workspaceId: proWorkspaceId,
    ...updates,
    version: '3',
  }
  await prisma.typebot.create({
    data: parseCreateTypebot(typebot),
  })
  return prisma.publicTypebot.create({
    data: parseTypebotToPublicTypebot(
      updates?.id ? `${updates?.id}-public` : 'publicBot',
      typebot
    ),
  })
}

export const deleteWorkspaces = async (workspaceIds: string[]) => {
  await prisma.workspace.deleteMany({
    where: { id: { in: workspaceIds } },
  })
}

export const deleteTypebots = async (typebotIds: string[]) => {
  await prisma.typebot.deleteMany({
    where: { id: { in: typebotIds } },
  })
}

export const deleteCredentials = async (credentialIds: string[]) => {
  await prisma.credentials.deleteMany({
    where: { id: { in: credentialIds } },
  })
}

export const deleteWebhooks = async (webhookIds: string[]) => {
  await prisma.webhook.deleteMany({
    where: { id: { in: webhookIds } },
  })
}

export const createWorkspaces = async (workspaces: Partial<Workspace>[]) => {
  const workspaceIds = workspaces.map((workspace) => workspace.id ?? createId())
  await prisma.workspace.createMany({
    data: workspaces.map((workspace, index) => ({
      id: workspaceIds[index],
      name: 'Free workspace',
      plan: Plan.FREE,
      ...workspace,
    })),
  })
  await prisma.memberInWorkspace.createMany({
    data: workspaces.map((_, index) => ({
      userId,
      workspaceId: workspaceIds[index],
      role: WorkspaceRole.ADMIN,
    })),
  })
  return workspaceIds
}

export const updateUser = (data: Partial<User>) =>
  prisma.user.update({
    data: {
      ...data,
      onboardingCategories: data.onboardingCategories ?? [],
    },
    where: {
      id: userId,
    },
  })

export const createWebhook = async (
  typebotId: string,
  webhookProps?: Partial<Webhook>
) => {
  try {
    await prisma.webhook.delete({ where: { id: 'webhook1' } })
  } catch {}
  return prisma.webhook.create({
    data: {
      method: 'GET',
      typebotId,
      id: 'webhook1',
      ...webhookProps,
      queryParams: webhookProps?.queryParams ?? [],
      headers: webhookProps?.headers ?? [],
    },
  })
}

export const createTypebots = async (partialTypebots: Partial<Typebot>[]) => {
  const typebotsWithId = partialTypebots.map((typebot) => {
    const typebotId = typebot.id ?? createId()
    return {
      ...typebot,
      id: typebotId,
      publicId: typebot.publicId ?? typebotId + '-public',
    }
  })
  await prisma.typebot.createMany({
    data: typebotsWithId.map(parseTestTypebot).map(parseCreateTypebot),
  })
  return prisma.publicTypebot.createMany({
    data: typebotsWithId.map((t) =>
      parseTypebotToPublicTypebot(t.publicId, parseTestTypebot(t))
    ),
  })
}

export const updateTypebot = async (
  partialTypebot: Partial<Typebot> & { id: string }
) => {
  await prisma.typebot.updateMany({
    where: { id: partialTypebot.id },
    data: parseUpdateTypebot(partialTypebot),
  })
  return prisma.publicTypebot.updateMany({
    where: { typebotId: partialTypebot.id },
    data: partialTypebot,
  })
}

export const updateWorkspace = async (
  id: string,
  data: Prisma.WorkspaceUncheckedUpdateManyInput
) => {
  await prisma.workspace.updateMany({
    where: { id: proWorkspaceId },
    data,
  })
}

export const parseCreateTypebot = (typebot: Typebot) => ({
  ...typebot,
  resultsTablePreferences:
    typebot.resultsTablePreferences === null
      ? Prisma.DbNull
      : typebot.resultsTablePreferences,
})

const parseUpdateTypebot = (typebot: Partial<Typebot>) => ({
  ...typebot,
  resultsTablePreferences:
    typebot.resultsTablePreferences === null
      ? Prisma.DbNull
      : typebot.resultsTablePreferences,
})

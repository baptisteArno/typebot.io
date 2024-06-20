import {
  Plan,
  Prisma,
  PrismaClient,
  User,
  Workspace,
  WorkspaceRole,
} from '@sniper.io/prisma'
import { createId } from '@sniper.io/lib/createId'
import { Sniper, SniperV6, HttpRequest } from '@sniper.io/schemas'
import { readFileSync } from 'fs'
import { proWorkspaceId, userId } from './databaseSetup'
import { parseTestSniper, parseSniperToPublicSniper } from './databaseHelpers'

const prisma = new PrismaClient()

type CreateFakeResultsProps = {
  sniperId: string
  count: number
  customResultIdPrefix?: string
  isChronological?: boolean
}

export const injectFakeResults = async ({
  count,
  customResultIdPrefix,
  sniperId,
  isChronological,
}: CreateFakeResultsProps) => {
  const resultIdPrefix = customResultIdPrefix ?? createId()
  await prisma.result.createMany({
    data: [
      ...Array.from(Array(count)).map((_, idx) => {
        const today = new Date()
        const rand = Math.random()
        return {
          id: `${resultIdPrefix}-result${idx}`,
          sniperId,
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
  return createAnswers({ resultIdPrefix, count })
}

const createAnswers = ({
  count,
  resultIdPrefix,
}: { resultIdPrefix: string } & Pick<CreateFakeResultsProps, 'count'>) => {
  return prisma.answerV2.createMany({
    data: [
      ...Array.from(Array(count)).map((_, idx) => ({
        resultId: `${resultIdPrefix}-result${idx}`,
        content: `content${idx}`,
        blockId: 'block1',
      })),
    ],
  })
}

export const importSniperInDatabase = async (
  path: string,
  updates?: Partial<Sniper>
) => {
  const sniperFile = JSON.parse(readFileSync(path).toString())
  const sniper = {
    events: null,
    ...sniperFile,
    workspaceId: proWorkspaceId,
    ...updates,
  }
  await prisma.sniper.create({
    data: parseCreateSniper(sniper),
  })
  return prisma.publicSniper.create({
    data: {
      ...parseSniperToPublicSniper(
        updates?.id ? `${updates?.id}-public` : 'publicBot',
        sniper
      ),
      events: sniper.events === null ? Prisma.DbNull : sniper.events,
    },
  })
}

export const deleteWorkspaces = async (workspaceIds: string[]) => {
  await prisma.workspace.deleteMany({
    where: { id: { in: workspaceIds } },
  })
}

export const deleteSnipers = async (sniperIds: string[]) => {
  await prisma.sniper.deleteMany({
    where: { id: { in: sniperIds } },
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
      displayedInAppNotifications:
        data.displayedInAppNotifications ?? Prisma.DbNull,
    },
    where: {
      id: userId,
    },
  })

export const createWebhook = async (
  sniperId: string,
  webhookProps?: Partial<HttpRequest>
) => {
  try {
    await prisma.webhook.delete({ where: { id: 'webhook1' } })
  } catch {}
  return prisma.webhook.create({
    data: {
      method: 'GET',
      sniperId,
      id: 'webhook1',
      ...webhookProps,
      queryParams: webhookProps?.queryParams ?? [],
      headers: webhookProps?.headers ?? [],
    },
  })
}

export const createSnipers = async (partialSnipers: Partial<SniperV6>[]) => {
  const snipersWithId = partialSnipers.map((sniper) => {
    const sniperId = sniper.id ?? createId()
    return {
      ...sniper,
      id: sniperId,
      publicId: sniper.publicId ?? sniperId + '-public',
    }
  })
  await prisma.sniper.createMany({
    data: snipersWithId.map(parseTestSniper).map(parseCreateSniper),
  })
  return prisma.publicSniper.createMany({
    data: snipersWithId.map((t) => ({
      ...parseSniperToPublicSniper(t.publicId, parseTestSniper(t)),
    })) as any,
  })
}

export const updateSniper = async (
  partialSniper: Partial<Sniper> & { id: string }
) => {
  await prisma.sniper.updateMany({
    where: { id: partialSniper.id },
    data: parseUpdateSniper(partialSniper),
  })
  return prisma.publicSniper.updateMany({
    where: { sniperId: partialSniper.id },
    data: {
      ...partialSniper,
      events:
        partialSniper.events === null ? Prisma.DbNull : partialSniper.events,
    },
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

export const parseCreateSniper = (sniper: Sniper) => ({
  ...sniper,
  resultsTablePreferences:
    sniper.resultsTablePreferences === null
      ? Prisma.DbNull
      : sniper.resultsTablePreferences,
  events: sniper.events === null ? Prisma.DbNull : sniper.events,
})

const parseUpdateSniper = (sniper: Partial<Sniper>) => ({
  ...sniper,
  resultsTablePreferences:
    sniper.resultsTablePreferences === null
      ? Prisma.DbNull
      : sniper.resultsTablePreferences,
  events: sniper.events === null ? Prisma.DbNull : sniper.events,
})

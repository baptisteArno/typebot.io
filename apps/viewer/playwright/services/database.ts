import {
  CredentialsType,
  defaultSettings,
  defaultTheme,
  PublicTypebot,
  SmtpCredentialsData,
  Block,
  Typebot,
  Webhook,
} from 'models'
import { PrismaClient, WorkspaceRole } from 'db'
import { readFileSync } from 'fs'
import { encrypt } from 'utils'

const prisma = new PrismaClient()

const proWorkspaceId = 'proWorkspaceViewer'

export const teardownDatabase = async () => {
  try {
    await prisma.workspace.deleteMany({
      where: { members: { some: { userId: { in: ['proUser'] } } } },
    })
    await prisma.user.deleteMany({
      where: { id: { in: ['proUser'] } },
    })
  } catch (err) {
    console.error(err)
  }
  return
}

export const setupDatabase = () => createUser()

export const createUser = () =>
  prisma.user.create({
    data: {
      id: 'proUser',
      email: 'user@email.com',
      name: 'User',
      apiTokens: { create: { token: 'userToken', name: 'default' } },
      workspaces: {
        create: {
          role: WorkspaceRole.ADMIN,
          workspace: {
            create: {
              id: proWorkspaceId,
              name: 'Pro workspace',
            },
          },
        },
      },
    },
  })

export const createWebhook = (typebotId: string, webhook?: Partial<Webhook>) =>
  prisma.webhook.create({
    data: {
      id: 'webhook1',
      typebotId,
      method: 'GET',
      ...webhook,
    },
  })

export const createTypebots = async (partialTypebots: Partial<Typebot>[]) => {
  await prisma.typebot.createMany({
    data: partialTypebots.map(parseTestTypebot) as any[],
  })
  return prisma.publicTypebot.createMany({
    data: partialTypebots.map((t) =>
      parseTypebotToPublicTypebot(t.id + '-published', parseTestTypebot(t))
    ) as any[],
  })
}

export const updateTypebot = async (
  partialTypebot: Partial<Typebot> & { id: string }
) => {
  await prisma.typebot.updateMany({
    where: { id: partialTypebot.id },
    data: partialTypebot,
  })
  return prisma.publicTypebot.updateMany({
    where: { typebotId: partialTypebot.id },
    data: partialTypebot,
  })
}

const parseTypebotToPublicTypebot = (
  id: string,
  typebot: Typebot
): PublicTypebot => ({
  id,
  groups: typebot.groups,
  typebotId: typebot.id,
  theme: typebot.theme,
  settings: typebot.settings,
  variables: typebot.variables,
  edges: typebot.edges,
  createdAt: typebot.createdAt,
  updatedAt: typebot.updatedAt,
})

const parseTestTypebot = (partialTypebot: Partial<Typebot>): Typebot => ({
  id: partialTypebot.id ?? 'typebot',
  folderId: null,
  name: 'My typebot',
  workspaceId: proWorkspaceId,
  icon: null,
  theme: defaultTheme,
  settings: defaultSettings,
  publicId: partialTypebot.id + '-public',
  publishedTypebotId: null,
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  customDomain: null,
  variables: [{ id: 'var1', name: 'var1' }],
  ...partialTypebot,
  edges: [
    {
      id: 'edge1',
      from: { groupId: 'group0', blockId: 'block0' },
      to: { groupId: 'group1' },
    },
  ],
  groups: [
    {
      id: 'group0',
      title: 'Group #0',
      blocks: [
        {
          id: 'block0',
          type: 'start',
          groupId: 'group0',
          label: 'Start',
          outgoingEdgeId: 'edge1',
        },
      ],
      graphCoordinates: { x: 0, y: 0 },
    },
    ...(partialTypebot.groups ?? []),
  ],
})

export const parseDefaultGroupWithBlock = (
  block: Partial<Block>
): Pick<Typebot, 'groups'> => ({
  groups: [
    {
      graphCoordinates: { x: 200, y: 200 },
      id: 'group1',
      blocks: [
        {
          id: 'block1',
          groupId: 'group1',
          ...block,
        } as Block,
      ],
      title: 'Group #1',
    },
  ],
})

export const importTypebotInDatabase = async (
  path: string,
  updates?: Partial<Typebot>
) => {
  const typebot: Typebot = {
    ...JSON.parse(readFileSync(path).toString()),
    ...updates,
    workspaceId: proWorkspaceId,
  }
  await prisma.typebot.create({
    data: typebot,
  })
  return prisma.publicTypebot.create({
    data: parseTypebotToPublicTypebot(
      updates?.id ? `${updates?.id}-public` : 'publicBot',
      typebot
    ),
  })
}

export const createResults = async ({ typebotId }: { typebotId: string }) => {
  await prisma.result.deleteMany()
  await prisma.result.createMany({
    data: [
      ...Array.from(Array(200)).map((_, idx) => {
        const today = new Date()
        const rand = Math.random()
        return {
          id: `result${idx}`,
          typebotId,
          createdAt: new Date(
            today.setTime(today.getTime() + 1000 * 60 * 60 * 24 * idx)
          ),
          isCompleted: rand > 0.5,
        }
      }),
    ],
  })
  return createAnswers()
}

const createAnswers = () => {
  return prisma.answer.createMany({
    data: [
      ...Array.from(Array(200)).map((_, idx) => ({
        resultId: `result${idx}`,
        content: `content${idx}`,
        blockId: 'block1',
        groupId: 'group1',
      })),
    ],
  })
}

export const createSmtpCredentials = (
  id: string,
  smtpData: SmtpCredentialsData
) => {
  const { encryptedData, iv } = encrypt(smtpData)
  return prisma.credentials.create({
    data: {
      id,
      data: encryptedData,
      iv,
      name: smtpData.from.email as string,
      type: CredentialsType.SMTP,
      workspaceId: proWorkspaceId,
    },
  })
}

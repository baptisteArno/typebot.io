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
import { GraphNavigation, Plan, PrismaClient, WorkspaceRole } from 'db'
import { readFileSync } from 'fs'
import { injectFakeResults } from 'utils'
import { encrypt } from 'utils/api'

const prisma = new PrismaClient()

const userId = 'userId'
export const freeWorkspaceId = 'freeWorkspace'
export const starterWorkspaceId = 'starterWorkspace'

export const teardownDatabase = async () => {
  await prisma.workspace.deleteMany({
    where: {
      members: {
        some: { userId },
      },
    },
  })
  await prisma.user.deleteMany({
    where: { id: userId },
  })
  return prisma.webhook.deleteMany()
}

export const setupDatabase = async () => {
  await createWorkspaces()
  await createUser()
}

export const createWorkspaces = async () =>
  prisma.workspace.createMany({
    data: [
      {
        id: freeWorkspaceId,
        name: 'Free workspace',
        plan: Plan.FREE,
      },
      {
        id: starterWorkspaceId,
        name: 'Starter workspace',
        plan: Plan.STARTER,
      },
    ],
  })

export const createUser = async () => {
  await prisma.user.create({
    data: {
      id: userId,
      email: 'user@email.com',
      name: 'John Doe',
      graphNavigation: GraphNavigation.TRACKPAD,
      apiTokens: {
        createMany: {
          data: [
            {
              name: 'Token 1',
              token: 'jirowjgrwGREHEtoken1',
              createdAt: new Date(2022, 1, 1),
            },
            {
              name: 'Github',
              token: 'jirowjgrwGREHEgdrgithub',
              createdAt: new Date(2022, 1, 2),
            },
            {
              name: 'N8n',
              token: 'jirowjgrwGREHrgwhrwn8n',
              createdAt: new Date(2022, 1, 3),
            },
          ],
        },
      },
    },
  })
  await prisma.memberInWorkspace.createMany({
    data: [
      { role: WorkspaceRole.ADMIN, userId, workspaceId: freeWorkspaceId },
      { role: WorkspaceRole.ADMIN, userId, workspaceId: starterWorkspaceId },
    ],
  })
}

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
    data: partialTypebots.map(parseTestTypebot),
  })
  return prisma.publicTypebot.createMany({
    data: partialTypebots.map((t) =>
      parseTypebotToPublicTypebot(t.id + '-published', parseTestTypebot(t))
    ),
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
  workspaceId: freeWorkspaceId,
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
    workspaceId: starterWorkspaceId,
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

export const createResults = injectFakeResults(prisma)

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
      workspaceId: freeWorkspaceId,
    },
  })
}

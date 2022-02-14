import {
  Block,
  CredentialsType,
  defaultSettings,
  defaultTheme,
  PublicBlock,
  PublicTypebot,
  Step,
  Typebot,
} from 'models'
import { DashboardFolder, PrismaClient, User } from 'db'
import { readFileSync } from 'fs'
import { encrypt } from 'utils'

const prisma = new PrismaClient()

export const teardownDatabase = async () => {
  const ownerFilter = {
    where: { ownerId: { in: ['freeUser', 'proUser'] } },
  }
  await prisma.user.deleteMany({
    where: { id: { in: ['freeUser', 'proUser'] } },
  })
  await prisma.credentials.deleteMany(ownerFilter)
  await prisma.dashboardFolder.deleteMany(ownerFilter)
  return prisma.typebot.deleteMany(ownerFilter)
}

export const setupDatabase = async () => {
  await createUsers()
  return createCredentials()
}

export const createUsers = () =>
  prisma.user.createMany({
    data: [
      { id: 'freeUser', email: 'free-user@email.com', name: 'Free user' },
      { id: 'proUser', email: 'pro-user@email.com', name: 'Pro user' },
    ],
  })

export const getSignedInUser = (email: string) =>
  prisma.user.findFirst({ where: { email } })

export const createTypebots = async (partialTypebots: Partial<Typebot>[]) => {
  await prisma.typebot.createMany({
    data: partialTypebots.map(parseTestTypebot) as any[],
  })
  return prisma.publicTypebot.createMany({
    data: partialTypebots.map((t) =>
      parseTypebotToPublicTypebot(t.id + '-public', parseTestTypebot(t))
    ) as any[],
  })
}

export const createFolders = (partialFolders: Partial<DashboardFolder>[]) =>
  prisma.dashboardFolder.createMany({
    data: partialFolders.map((folder) => ({
      ownerId: 'proUser',
      name: 'Folder #1',
      ...folder,
    })),
  })

const createCredentials = () => {
  const { encryptedData, iv } = encrypt({
    expiry_date: 1642441058842,
    access_token:
      'ya29.A0ARrdaM--PV_87ebjywDJpXKb77NBFJl16meVUapYdfNv6W6ZzqqC47fNaPaRjbDbOIIcp6f49cMaX5ndK9TAFnKwlVqz3nrK9nLKqgyDIhYsIq47smcAIZkK56SWPx3X3DwAFqRu2UPojpd2upWwo-3uJrod',
    // This token is linked to a mock Google account (typebot.test.user@gmail.com)
    refresh_token:
      '1//03NRE9V8T-aayCgYIARAAGAMSNwF-L9Ir6zVzF-wm30psz0lbDJj5Y9OgqTO0cvBISODMW4QTR0VK40BLnOQgcHCHkb9c769TAhQ',
  })
  return prisma.credentials.createMany({
    data: [
      {
        name: 'test2@gmail.com',
        ownerId: 'proUser',
        type: CredentialsType.GOOGLE_SHEETS,
        data: encryptedData,
        iv,
      },
    ],
  })
}

export const updateUser = (data: Partial<User>) =>
  prisma.user.update({
    data,
    where: {
      id: 'proUser',
    },
  })

export const createResults = async ({ typebotId }: { typebotId: string }) => {
  await prisma.result.deleteMany()
  await prisma.result.createMany({
    data: [
      ...Array.from(Array(200)).map((_, idx) => {
        const today = new Date()
        return {
          id: `result${idx}`,
          typebotId,
          createdAt: new Date(
            today.setTime(today.getTime() + 1000 * 60 * 60 * 24 * idx)
          ),
          isCompleted: false,
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
        stepId: 'step1',
        blockId: 'block1',
      })),
    ],
  })
}

const parseTypebotToPublicTypebot = (
  id: string,
  typebot: Typebot
): PublicTypebot => ({
  id,
  name: typebot.name,
  blocks: parseBlocksToPublicBlocks(typebot.blocks),
  typebotId: typebot.id,
  theme: typebot.theme,
  settings: typebot.settings,
  publicId: typebot.publicId,
  variables: typebot.variables,
  edges: typebot.edges,
})

const parseBlocksToPublicBlocks = (blocks: Block[]): PublicBlock[] =>
  blocks.map((b) => ({
    ...b,
    steps: b.steps.map((s) =>
      'webhook' in s ? { ...s, webhook: s.webhook.id } : s
    ),
  }))

const parseTestTypebot = (partialTypebot: Partial<Typebot>): Typebot => ({
  id: partialTypebot.id ?? 'typebot',
  folderId: null,
  name: 'My typebot',
  ownerId: 'proUser',
  theme: defaultTheme,
  settings: defaultSettings,
  createdAt: new Date(),
  publicId: null,
  publishedTypebotId: null,
  updatedAt: new Date(),
  variables: [],
  ...partialTypebot,
  edges: [
    {
      id: 'edge1',
      from: { blockId: 'block0', stepId: 'step0' },
      to: { blockId: 'block1' },
    },
  ],
  blocks: [
    {
      id: 'block0',
      title: 'Block #0',
      steps: [
        {
          id: 'step0',
          type: 'start',
          blockId: 'block0',
          label: 'Start',
          outgoingEdgeId: 'edge1',
        },
      ],
      graphCoordinates: { x: 0, y: 0 },
    },
    ...(partialTypebot.blocks ?? []),
  ],
})

export const parseDefaultBlockWithStep = (
  step: Partial<Step>
): Pick<Typebot, 'blocks'> => ({
  blocks: [
    {
      graphCoordinates: { x: 200, y: 200 },
      id: 'block1',
      steps: [
        {
          id: 'step1',
          blockId: 'block1',
          ...step,
        } as Step,
      ],
      title: 'Block #1',
    },
  ],
})

export const importTypebotInDatabase = (
  path: string,
  updates?: Partial<Typebot>
) => {
  const typebot: any = {
    ...JSON.parse(readFileSync(path).toString()),
    ...updates,
    ownerId: 'proUser',
  }
  return prisma.typebot.create({
    data: typebot,
  })
}

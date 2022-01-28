import {
  defaultSettings,
  defaultTheme,
  PublicTypebot,
  Step,
  Typebot,
} from 'models'
import { CredentialsType, DashboardFolder, Plan, PrismaClient, User } from 'db'
import { readFileSync } from 'fs'

export const user = { id: 'user1', email: 'test1@gmail.com' }

const prisma = new PrismaClient()

export const teardownDatabase = async () => prisma.user.deleteMany()

export const setupDatabase = async () => {
  await createUsers()
  return createCredentials()
}

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
      ownerId: user.id,
      name: 'Folder #1',
      id: 'folder',
      ...folder,
    })),
  })

const createUsers = () =>
  prisma.user.create({
    data: {
      ...user,
      emailVerified: new Date(),
      plan: Plan.FREE,
      stripeId: 'stripe-test2',
    },
  })

const createCredentials = () => {
  if (!process.env.GOOGLE_REFRESH_TOKEN_TEST)
    console.warn(
      'GOOGLE_REFRESH_TOKEN_TEST env var is missing. It is required to run Google Sheets tests'
    )
  return prisma.credentials.createMany({
    data: [
      {
        name: 'test2@gmail.com',
        ownerId: user.id,
        type: CredentialsType.GOOGLE_SHEETS,
        data: {
          expiry_date: 1642441058842,
          access_token:
            'ya29.A0ARrdaM--PV_87ebjywDJpXKb77NBFJl16meVUapYdfNv6W6ZzqqC47fNaPaRjbDbOIIcp6f49cMaX5ndK9TAFnKwlVqz3nrK9nLKqgyDIhYsIq47smcAIZkK56SWPx3X3DwAFqRu2UPojpd2upWwo-3uJrod',
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN_TEST,
        },
      },
    ],
  })
}

export const updateUser = (data: Partial<User>) =>
  prisma.user.update({ data, where: { id: user.id } })

export const createResults = async ({ typebotId }: { typebotId: string }) => {
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
  blocks: typebot.blocks,
  steps: typebot.steps,
  name: typebot.name,
  typebotId: typebot.id,
  theme: typebot.theme,
  settings: typebot.settings,
  publicId: typebot.publicId,
  choiceItems: typebot.choiceItems,
  variables: typebot.variables,
  edges: typebot.edges,
})

export const loadRawTypebotInDatabase = (typebot: Typebot) =>
  prisma.typebot.create({
    data: {
      ...typebot,
      id: 'typebot4',
      ownerId: user.id,
    } as any,
  })

const parseTestTypebot = (partialTypebot: Partial<Typebot>): Typebot => ({
  id: partialTypebot.id ?? 'typebot',
  folderId: null,
  name: 'My typebot',
  ownerId: user.id,
  theme: defaultTheme,
  settings: defaultSettings,
  createdAt: new Date(),
  choiceItems: partialTypebot.choiceItems ?? {
    byId: {
      choice1: {
        id: 'choice1',
        stepId: 'step1',
      },
    },
    allIds: ['choice1'],
  },
  publicId: null,
  publishedTypebotId: null,
  updatedAt: new Date(),
  variables: { byId: {}, allIds: [] },
  webhooks: { byId: {}, allIds: [] },
  edges: {
    byId: {
      edge1: {
        id: 'edge1',
        from: { blockId: 'block0', stepId: 'step0' },
        to: { blockId: 'block1' },
      },
    },
    allIds: ['edge1'],
  },
  ...partialTypebot,
  blocks: {
    byId: {
      block0: {
        id: 'block0',
        title: 'Block #0',
        stepIds: ['step0'],
        graphCoordinates: { x: 0, y: 0 },
      },
      ...partialTypebot.blocks?.byId,
    },
    allIds: ['block0', ...(partialTypebot.blocks?.allIds ?? [])],
  },
  steps: {
    byId: {
      step0: {
        id: 'step0',
        type: 'start',
        blockId: 'block0',
        label: 'Start',
        edgeId: 'edge1',
      },
      ...partialTypebot.steps?.byId,
    },
    allIds: ['step0', ...(partialTypebot.steps?.allIds ?? [])],
  },
})

export const parseDefaultBlockWithStep = (
  step: Partial<Step>
): Pick<Typebot, 'blocks' | 'steps'> => ({
  blocks: {
    byId: {
      block1: {
        graphCoordinates: { x: 200, y: 200 },
        id: 'block1',
        stepIds: ['step1'],
        title: 'Block #1',
      },
    },
    allIds: ['block1'],
  },
  steps: {
    byId: {
      step1: {
        id: 'step1',
        blockId: 'block1',
        ...step,
      } as Step,
    },
    allIds: ['step1'],
  },
})

export const importTypebotInDatabase = (
  path: string,
  updates?: Partial<Typebot>
) => {
  const typebot: Typebot = JSON.parse(readFileSync(path).toString())
  return prisma.typebot.create({
    data: { ...typebot, ...updates, ownerId: user.id } as any,
  })
}

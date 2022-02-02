import {
  defaultSettings,
  defaultTheme,
  PublicTypebot,
  Step,
  Typebot,
} from 'models'
import { CredentialsType, DashboardFolder, PrismaClient, User } from 'db'
import { readFileSync } from 'fs'

const prisma = new PrismaClient()

export const teardownDatabase = async () => {
  await prisma.credentials.deleteMany()
  await prisma.dashboardFolder.deleteMany()
  return prisma.typebot.deleteMany()
}

export const setupDatabase = async (userEmail: string) => {
  const createdUser = await getSignedInUser(userEmail)
  if (!createdUser) throw new Error("Couldn't find user")
  process.env.PLAYWRIGHT_USER_ID = createdUser.id
  return createCredentials()
}

const getSignedInUser = (email: string) =>
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
      ownerId: process.env.PLAYWRIGHT_USER_ID as string,
      name: 'Folder #1',
      ...folder,
    })),
  })

const createCredentials = () =>
  prisma.credentials.createMany({
    data: [
      {
        name: 'test2@gmail.com',
        ownerId: process.env.PLAYWRIGHT_USER_ID as string,
        type: CredentialsType.GOOGLE_SHEETS,
        data: {
          expiry_date: 1642441058842,
          access_token:
            'ya29.A0ARrdaM--PV_87ebjywDJpXKb77NBFJl16meVUapYdfNv6W6ZzqqC47fNaPaRjbDbOIIcp6f49cMaX5ndK9TAFnKwlVqz3nrK9nLKqgyDIhYsIq47smcAIZkK56SWPx3X3DwAFqRu2UPojpd2upWwo-3uJrod',
          // This token is linked to a mock Google account (typebot.test.user@gmail.com)
          refresh_token:
            '1//0379tIHBxszeXCgYIARAAGAMSNwF-L9Ir0zhkzhblwXqn3_jYqRP3pajcUpqkjRU3fKZZ_eQakOa28amUHSQ-Q9fMzk89MpRTvkc',
        },
      },
    ],
  })

export const updateUser = (data: Partial<User>) =>
  prisma.user.update({
    data,
    where: { id: process.env.PLAYWRIGHT_USER_ID as string },
  })

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

const parseTestTypebot = (partialTypebot: Partial<Typebot>): Typebot => ({
  id: partialTypebot.id ?? 'typebot',
  folderId: null,
  name: 'My typebot',
  ownerId: process.env.PLAYWRIGHT_USER_ID as string,
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
  const typebot: any = {
    ...JSON.parse(readFileSync(path).toString()),
    ...updates,
    ownerId: process.env.PLAYWRIGHT_USER_ID,
  }
  return prisma.typebot.create({
    data: typebot,
  })
}

import {
  defaultTextInputOptions,
  InputStepType,
  PublicTypebot,
  TextInputStep,
  Typebot,
} from 'models'
import { CredentialsType, Plan, PrismaClient } from 'db'
import { parseTestTypebot } from './utils'
import { users } from './data'

const prisma = new PrismaClient()

const teardownTestData = async () => prisma.user.deleteMany()

export const seedDb = async (googleRefreshToken: string) => {
  await teardownTestData()
  await createUsers()
  await createCredentials(googleRefreshToken)
  await createFolders()
  await createTypebots()
  await createResults()
  return createAnswers()
}

export const createTypebot = (typebot: Typebot) =>
  prisma.typebot.create({ data: typebot as any })

const createUsers = () =>
  prisma.user.createMany({
    data: [
      { ...users[0], emailVerified: new Date() },
      {
        ...users[1],
        emailVerified: new Date(),
        plan: Plan.PRO,
        stripeId: 'stripe-test2',
      },
    ],
  })

const createCredentials = (refresh_token: string) =>
  prisma.credentials.createMany({
    data: [
      {
        name: 'test2@gmail.com',
        ownerId: users[1].id,
        type: CredentialsType.GOOGLE_SHEETS,
        data: {
          expiry_date: 1642441058842,
          access_token:
            'ya29.A0ARrdaM--PV_87ebjywDJpXKb77NBFJl16meVUapYdfNv6W6ZzqqC47fNaPaRjbDbOIIcp6f49cMaX5ndK9TAFnKwlVqz3nrK9nLKqgyDIhYsIq47smcAIZkK56SWPx3X3DwAFqRu2UPojpd2upWwo-3uJrod',
          refresh_token,
        },
      },
    ],
  })

const createFolders = () =>
  prisma.dashboardFolder.createMany({
    data: [{ ownerId: users[1].id, name: 'Folder #1', id: 'folder1' }],
  })

const createTypebots = async () => {
  const typebot2 = {
    ...parseTestTypebot({
      id: 'typebot2',
      name: 'Typebot #2',
      ownerId: users[1].id,
      blocks: {
        byId: {
          block1: {
            id: 'block1',
            title: 'Block #1',
            stepIds: ['step1'],
            graphCoordinates: { x: 200, y: 200 },
          },
        },
        allIds: ['block1'],
      },
      steps: {
        byId: {
          step1: {
            id: 'step1',
            type: InputStepType.TEXT,
            blockId: 'block1',
            options: defaultTextInputOptions,
          } as TextInputStep,
        },
        allIds: ['step1'],
      },
    }),
  }
  await prisma.typebot.createMany({
    data: [
      {
        ...parseTestTypebot({
          id: 'typebot1',
          name: 'Typebot #1',
          ownerId: users[1].id,
          blocks: { byId: {}, allIds: [] },
          steps: { byId: {}, allIds: [] },
        }),
      },
      typebot2,
    ] as any,
  })
  return prisma.publicTypebot.createMany({
    data: [parseTypebotToPublicTypebot('publictypebot2', typebot2)] as any,
  })
}

const createResults = () => {
  return prisma.result.createMany({
    data: [
      ...Array.from(Array(200)).map((_, idx) => {
        const today = new Date()
        return {
          id: `result${idx}`,
          typebotId: 'typebot2',
          createdAt: new Date(
            today.setTime(today.getTime() + 1000 * 60 * 60 * 24 * idx)
          ),
          isCompleted: false,
        }
      }),
    ],
  })
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
    data: { ...typebot, id: 'typebot4', ownerId: users[1].id } as any,
  })

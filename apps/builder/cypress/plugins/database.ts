import { PublicTypebot, StepType, Typebot } from 'models'
import { Plan, PrismaClient } from 'db'
import { parseTestTypebot } from './utils'

const prisma = new PrismaClient()

const teardownTestData = async () => prisma.user.deleteMany()

export const seedDb = async () => {
  await teardownTestData()
  await createUsers()
  await createFolders()
  await createTypebots()
  await createResults()
  return createAnswers()
}

const createUsers = () =>
  prisma.user.createMany({
    data: [
      { id: 'test1', email: 'test1@gmail.com', emailVerified: new Date() },
      {
        id: 'test2',
        email: 'test2@gmail.com',
        emailVerified: new Date(),
        plan: Plan.PRO,
        stripeId: 'stripe-test2',
      },
    ],
  })

const createFolders = () =>
  prisma.dashboardFolder.createMany({
    data: [{ ownerId: 'test2', name: 'Folder #1', id: 'folder1' }],
  })

const createTypebots = async () => {
  const typebot2 = {
    ...parseTestTypebot({
      id: 'typebot2',
      name: 'Typebot #2',
      ownerId: 'test2',
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
            type: StepType.TEXT_INPUT,
            blockId: 'block1',
          },
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
          ownerId: 'test2',
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
})

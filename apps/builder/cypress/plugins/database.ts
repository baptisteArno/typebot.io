import { parseNewTypebot, PublicTypebot, StepType, Typebot } from 'bot-engine'
import { Plan, PrismaClient } from 'db'

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
  const typebot2: Typebot = {
    ...(parseNewTypebot({
      name: 'Typebot #2',
      ownerId: 'test2',
      folderId: null,
    }) as Typebot),
    id: 'typebot2',
    startBlock: {
      id: 'start-block',
      steps: [
        {
          id: 'start-step',
          blockId: 'start-block',
          type: StepType.START,
          label: 'Start',
          target: { blockId: 'block1' },
        },
      ],
      graphCoordinates: { x: 0, y: 0 },
      title: 'Start',
    },
    blocks: [
      {
        title: 'Block #1',
        id: 'block1',
        steps: [{ id: 'step1', type: StepType.TEXT_INPUT, blockId: 'block1' }],
        graphCoordinates: { x: 200, y: 200 },
      },
    ],
  }
  await prisma.typebot.createMany({
    data: [
      {
        ...parseNewTypebot({
          name: 'Typebot #1',
          ownerId: 'test2',
          folderId: null,
        }),
        id: 'typebot1',
      },
      typebot2,
    ],
  })
  return prisma.publicTypebot.createMany({
    data: [parseTypebotToPublicTypebot('publictypebot2', typebot2)],
  })
}

const createResults = () => {
  return prisma.result.createMany({
    data: [
      {
        typebotId: 'typebot1',
      },
      {
        typebotId: 'typebot1',
      },
      {
        id: 'result1',
        typebotId: 'typebot2',
      },
      {
        id: 'result2',
        typebotId: 'typebot2',
      },
      {
        id: 'result3',
        typebotId: 'typebot2',
      },
    ],
  })
}

const createAnswers = () => {
  return prisma.answer.createMany({
    data: [
      {
        resultId: 'result1',
        content: 'content 1',
        stepId: 'step1',
        blockId: 'block1',
      },
      {
        resultId: 'result2',
        content: 'content 2',
        stepId: 'step1',
        blockId: 'block1',
      },
      {
        resultId: 'result3',
        content: 'content 3',
        stepId: 'step1',
        blockId: 'block1',
      },
    ],
  })
}

const parseTypebotToPublicTypebot = (
  id: string,
  typebot: Typebot
): PublicTypebot => ({
  id,
  blocks: typebot.blocks,
  name: typebot.name,
  startBlock: typebot.startBlock,
  typebotId: typebot.id,
  theme: typebot.theme,
  settings: typebot.settings,
  publicId: typebot.publicId,
})

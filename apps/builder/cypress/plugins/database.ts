import { PrismaClient } from '.prisma/client'
import { Block, StartBlock, StepType } from 'bot-engine'

const prisma = new PrismaClient()

const teardownTestData = async () => prisma.user.deleteMany()

export const seedDb = async () => {
  await teardownTestData()
  await createUsers()
  await createFolders()
  return createTypebots()
}

const createUsers = () =>
  prisma.user.createMany({
    data: [
      { id: 'test1', email: 'test1@gmail.com', emailVerified: new Date() },
      { id: 'test2', email: 'test2@gmail.com', emailVerified: new Date() },
    ],
  })

const createFolders = () =>
  prisma.dashboardFolder.createMany({
    data: [{ ownerId: 'test2', name: 'Folder #1', id: 'folder1' }],
  })

const createTypebots = () => {
  const startBlock: StartBlock = {
    graphCoordinates: { x: 0, y: 0 },
    id: 'start-block',
    steps: [
      {
        id: 'start-step',
        blockId: 'start-block',
        type: StepType.START,
        label: 'Start',
      },
    ],
    title: 'Home',
  }
  const blocks: Block[] = [
    {
      id: 'block1',
      title: 'Block1',
      graphCoordinates: { x: 150, y: 150 },
      steps: [
        { id: 'step1', blockId: 'block1', type: StepType.TEXT, content: '' },
        {
          id: 'step2',
          blockId: 'block1',
          type: StepType.DATE_PICKER,
          content: '',
        },
      ],
    },
    {
      id: 'block2',
      title: 'Block2',
      graphCoordinates: { x: 300, y: 300 },
      steps: [
        { id: 'step1', blockId: 'block2', type: StepType.TEXT, content: '' },
      ],
    },
  ]
  return prisma.typebot.createMany({
    data: [
      { id: 'typebot1', name: 'Typebot #1', ownerId: 'test2', startBlock },
      {
        id: 'typebot2',
        name: 'Typebot #2',
        ownerId: 'test2',
        startBlock,
        blocks,
      },
    ],
  })
}

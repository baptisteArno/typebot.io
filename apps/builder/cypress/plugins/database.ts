import { PrismaClient } from '.prisma/client'
import { StartBlock, StepType } from 'bot-engine'

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
    title: 'Start',
  }
  prisma.typebot.createMany({
    data: [
      { id: 'typebot1', name: 'Typebot #1', ownerId: 'test2', startBlock },
    ],
  })
}

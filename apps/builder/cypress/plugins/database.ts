import { parseNewTypebot } from 'bot-engine'
import { Plan, PrismaClient } from 'db'

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

const createTypebots = () => {
  return prisma.typebot.createMany({
    data: [
      {
        ...parseNewTypebot({
          name: 'Typebot #1',
          ownerId: 'test2',
          folderId: null,
        }),
        id: 'typebot1',
      },
      {
        ...parseNewTypebot({
          name: 'Typebot #2',
          ownerId: 'test2',
          folderId: null,
        }),
        id: 'typebot2',
      },
    ],
  })
}

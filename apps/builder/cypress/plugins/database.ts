import { PrismaClient } from '.prisma/client'

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

const createTypebots = () =>
  prisma.typebot.createMany({
    data: [{ name: 'Typebot #1', ownerId: 'test2' }],
  })

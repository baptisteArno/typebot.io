import { PrismaClient } from 'db'
import { randomUUID } from 'crypto'
import path from 'path'

require('dotenv').config({
  path: path.join(
    __dirname,
    process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.local'
  ),
})

const prisma = new PrismaClient()
const main = async () => {
  await prisma.user.updateMany({
    where: { apiToken: null },
    data: { apiToken: randomUUID() },
  })
}

main().then()

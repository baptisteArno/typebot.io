import { PrismaClient } from 'db'
import path from 'path'
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
})

require('dotenv').config({
  path: path.join(
    __dirname,
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : process.env.NODE_ENV === 'staging'
      ? '.env.staging'
      : '.env.local'
  ),
})

const main = async () => {
  prisma.$on('query', (e) => {
    console.log('Query: ' + e.query)
    console.log('Params: ' + e.params)
    console.log('Duration: ' + e.duration + 'ms')
  })
  const date = new Date()
  const lastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 10)
  const answers = await prisma.answer.findMany({
    where: { createdAt: { lt: lastMonth } },
    take: 100,
  })
}

main().then()

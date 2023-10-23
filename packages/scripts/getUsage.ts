import { PrismaClient } from '@typebot.io/prisma'
import { promptAndSetEnvironment } from './utils'

const getUsage = async () => {
  await promptAndSetEnvironment()
  const prisma = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error'],
  })

  prisma.$on('query', (e) => {
    console.log(e.query)
    console.log(e.params)
    console.log(e.duration, 'ms')
  })

  const count = await prisma.result.count({
    where: {
      typebot: { workspaceId: '' },
      hasStarted: true,
      createdAt: {
        gte: '2023-09-18T00:00:00.000Z',
        lt: '2023-10-18T00:00:00.000Z',
      },
    },
  })

  console.log(count)
}

getUsage()

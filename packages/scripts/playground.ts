import { PrismaClient } from '@typebot.io/prisma'
import { promptAndSetEnvironment } from './utils'

const executePlayground = async () => {
  await promptAndSetEnvironment()
  const prisma = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error'],
  })

  prisma.$on('query', (e) => {
    console.log(e.query)
    console.log(e.params)
    console.log(e.duration, 'ms')
  })

  const result = await prisma.workspace.findMany({
    where: {
      members: {
        some: {
          user: {
            email: '',
          },
        },
      },
    },
    include: {
      members: true,
      typebots: {
        select: {
          name: true,
          riskLevel: true,
          id: true,
        },
      },
    },
  })
  console.log(JSON.stringify(result))

  // await prisma.bannedIp.deleteMany({})

  // const result = await prisma.coupon.findMany({
  //   where: {
  //     code: '',
  //   },
  // })

  // console.log(result)
}

executePlayground()

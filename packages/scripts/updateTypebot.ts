import { PrismaClient } from '@typebot.io/prisma'
import { promptAndSetEnvironment } from './utils'
import * as p from '@clack/prompts'

const updateTypebot = async () => {
  await promptAndSetEnvironment('production')

  const prisma = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error'],
  })

  prisma.$on('query', (e) => {
    console.log(e.query)
    console.log(e.params)
    console.log(e.duration, 'ms')
  })

  const typebotId = (await p.text({
    message: 'Typebot ID?',
  })) as string

  const typebot = await prisma.typebot.update({
    where: {
      id: typebotId,
    },
    data: {
      riskLevel: -1,
    },
  })

  console.log(typebot)
}

updateTypebot()

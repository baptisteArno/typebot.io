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

  const workspaceId = (await p.text({
    message: 'Workspace ID?',
  })) as string

  const workspace = await prisma.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      isVerified: true,
    },
  })

  console.log(workspace)
}

updateTypebot()

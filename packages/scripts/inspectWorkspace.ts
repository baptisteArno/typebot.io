import { PrismaClient } from '@typebot.io/prisma'
import { promptAndSetEnvironment } from './utils'
import * as p from '@clack/prompts'

const inspectWorkspace = async () => {
  await promptAndSetEnvironment('production')

  const id = await p.text({
    message: 'Workspace ID?',
  })

  if (!id || typeof id !== 'string') {
    console.log('No ID provided')
    return
  }

  const prisma = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error'],
  })

  const workspace = await prisma.workspace.findFirst({
    where: {
      id,
    },
    include: {
      typebots: {
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          updatedAt: true,
          id: true,
          name: true,
        },
      },
      members: {
        select: {
          user: { select: { email: true } },
          role: true,
        },
      },
    },
  })

  if (!workspace) {
    console.log('Workspace not found')
    return
  }

  console.log(JSON.stringify(workspace, null, 2))
}

inspectWorkspace()

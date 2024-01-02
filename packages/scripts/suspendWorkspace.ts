import { PrismaClient } from '@typebot.io/prisma'

const suspendWorkspace = async () => {
  const prisma = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error'],
  })

  prisma.$on('query', (e) => {
    console.log(e.query)
    console.log(e.params)
    console.log(e.duration, 'ms')
  })

  const typebot = await prisma.typebot.findUnique({
    where: {
      id: '',
    },
    select: {
      workspaceId: true,
    },
  })

  if (!typebot) {
    console.log('Typebot not found')
    return
  }

  const result = await prisma.workspace.update({
    where: {
      id: typebot.workspaceId,
    },
    data: {
      isSuspended: true,
    },
  })

  console.log(JSON.stringify(result))
}

suspendWorkspace()

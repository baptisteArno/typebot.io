import { PrismaClient } from '@typebot.io/prisma'
import * as p from '@clack/prompts'
import { isEmpty } from '@typebot.io/lib'
import { promptAndSetEnvironment } from './utils'

const suspendWorkspace = async () => {
  await promptAndSetEnvironment('production')
  const prisma = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error'],
  })

  prisma.$on('query', (e) => {
    console.log(e.query)
    console.log(e.params)
    console.log(e.duration, 'ms')
  })

  const type = await p.select({
    message: 'Select way',
    options: [
      { label: 'Typebot ID', value: 'id' },
      { label: 'Typebot public ID', value: 'publicId' },
      { label: 'Workspace ID', value: 'workspaceId' },
    ],
  })

  if (!type || typeof type !== 'string') return

  const val = await p.text({
    message: 'Enter value',
  })

  if (!val || typeof val !== 'string') return

  let workspaceId = type === 'workspaceId' ? val : undefined

  if (!workspaceId) {
    const typebot = await prisma.typebot.findFirst({
      where: {
        [type]: val,
      },
      select: {
        workspaceId: true,
      },
    })

    if (!typebot) {
      console.log('Typebot not found')
      return
    }

    workspaceId = typebot.workspaceId
  }

  if (isEmpty(workspaceId)) {
    console.log('Workspace not found')
    return
  }

  const result = await prisma.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      isSuspended: true,
    },
  })

  console.log(JSON.stringify(result))
}

suspendWorkspace()

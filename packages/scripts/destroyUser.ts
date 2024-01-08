import { PrismaClient } from '@typebot.io/prisma'
import * as p from '@clack/prompts'
import { promptAndSetEnvironment } from './utils'

const destroyUser = async () => {
  await promptAndSetEnvironment('production')

  const prisma = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error'],
  })

  prisma.$on('query', (e) => {
    console.log(e.query)
    console.log(e.params)
    console.log(e.duration, 'ms')
  })

  const email = (await p.text({
    message: 'User email?',
  })) as string

  if (!email || typeof email !== 'string') {
    console.log('No email provided')
    return
  }

  const workspaces = await prisma.workspace.findMany({
    where: {
      members: { every: { user: { email } } },
    },
    include: {
      members: { select: { user: { select: { email: true } }, role: true } },
      typebots: {
        select: {
          results: {
            select: { id: true },
          },
        },
      },
    },
  })

  console.log(`Found ${workspaces.length} workspaces`)

  const proceed = await p.confirm({ message: 'Proceed?' })
  if (!proceed || typeof proceed !== 'boolean') {
    console.log('Aborting')
    return
  }

  for (const workspace of workspaces) {
    const hasResults = workspace.typebots.some((t) => t.results.length > 0)
    if (hasResults) {
      console.log(
        `Workspace ${workspace.name} has results. Deleting results first...`,
        workspace.typebots.filter((t) => t.results.length > 0)
      )
      console.log(JSON.stringify({ members: workspace.members }, null, 2))
      const proceed = await p.confirm({ message: 'Proceed?' })
      if (!proceed || typeof proceed !== 'boolean') {
        console.log('Aborting')
        return
      }
    }
    for (const typebot of workspace.typebots.filter(
      (t) => t.results.length > 0
    )) {
      for (const result of typebot.results) {
        await prisma.result.deleteMany({ where: { id: result.id } })
      }
    }
    await prisma.workspace.delete({ where: { id: workspace.id } })
  }

  const user = await prisma.user.delete({ where: { email } })

  console.log(`Deleted user ${JSON.stringify(user, null, 2)}`)
}

destroyUser()

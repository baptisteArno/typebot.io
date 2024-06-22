import { isCancel, text, confirm } from '@clack/prompts'
import { Plan, PrismaClient } from '@sniper.io/prisma'
import { writeFileSync } from 'fs'

export const destroyUser = async (userEmail?: string) => {
  const prisma = new PrismaClient()

  const email =
    userEmail ??
    (await text({
      message: 'User email?',
    }))

  if (!email || isCancel(email)) {
    console.log('No email provided')
    return
  }

  const workspaces = await prisma.workspace.findMany({
    where: {
      members: { every: { user: { email } } },
    },
    include: {
      members: { select: { user: { select: { email: true } }, role: true } },
      snipers: {
        select: {
          results: {
            select: { id: true },
          },
        },
      },
    },
  })

  console.log(`Found ${workspaces.length} workspaces`)

  if (workspaces.some((w) => w.plan !== Plan.FREE)) {
    console.log(
      `Some workspaces have a plan other than FREE. Something is wrong. Logging and exiting...`
    )
    writeFileSync(
      'logs/workspaces-issue.json',
      JSON.stringify(workspaces, null, 2)
    )
    return
  }

  if (
    workspaces.some((w) =>
      w.members.some((m) => m.user.email && m.user.email !== email)
    )
  ) {
    console.log(
      `Some workspaces have other members. Something is wrong. Logging and exiting...`
    )
    writeFileSync(
      'logs/workspaces-issue.json',
      JSON.stringify(workspaces, null, 2)
    )
    return
  }

  console.log('All workspaces have a FREE plan')

  const proceed = await confirm({ message: 'Proceed?' })
  if (!proceed || typeof proceed !== 'boolean') {
    console.log('Aborting')
    return
  }

  for (const workspace of workspaces) {
    const hasResults = workspace.snipers.some((t) => t.results.length > 0)
    if (hasResults) {
      console.log(
        `Workspace ${workspace.name} has results. Deleting results first...`,
        workspace.snipers.filter((t) => t.results.length > 0)
      )
      console.log(JSON.stringify({ members: workspace.members }, null, 2))
      const proceed = await confirm({ message: 'Proceed?' })
      if (!proceed || typeof proceed !== 'boolean') {
        console.log('Aborting')
        return
      }
    }
    for (const sniper of workspace.snipers.filter(
      (t) => t.results.length > 0
    )) {
      for (const result of sniper.results) {
        await prisma.result.deleteMany({ where: { id: result.id } })
      }
    }
    await prisma.workspace.delete({ where: { id: workspace.id } })
  }

  const user = await prisma.user.delete({ where: { email } })

  console.log(`Deleted user ${JSON.stringify(user, null, 2)}`)
}

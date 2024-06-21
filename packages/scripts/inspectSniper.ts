import { PrismaClient } from '@sniper.io/prisma'
import { promptAndSetEnvironment } from './utils'
import * as p from '@clack/prompts'
import { isCancel } from '@clack/prompts'

const inspectSniper = async () => {
  await promptAndSetEnvironment('production')

  const type = await p.select<any, 'id' | 'publicId'>({
    message: 'Select way',
    options: [
      { label: 'ID', value: 'id' },
      { label: 'Public ID', value: 'publicId' },
    ],
  })

  if (!type || isCancel(type)) process.exit()

  const val = await p.text({
    message: 'Enter value',
  })

  if (!val || isCancel(val)) process.exit()

  const prisma = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error'],
  })

  const sniper = await prisma.sniper.findFirst({
    where: {
      [type]: val,
    },
    select: {
      id: true,
      name: true,
      riskLevel: true,
      publicId: true,
      customDomain: true,
      createdAt: true,
      isArchived: true,
      isClosed: true,
      publishedSniper: {
        select: {
          id: true,
        },
      },
      workspace: {
        select: {
          id: true,
          name: true,
          plan: true,
          isPastDue: true,
          isSuspended: true,
          members: {
            select: {
              role: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!sniper) {
    console.log('Sniper not found')
    return
  }

  console.log(`https://app.sniper.io/snipers/${sniper.id}/edit`)

  console.log(JSON.stringify(sniper, null, 2))
}

inspectSniper()

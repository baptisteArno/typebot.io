import { PrismaClient } from '@typebot.io/prisma'
import { promptAndSetEnvironment } from './utils'
import * as p from '@clack/prompts'

const inspectTypebot = async () => {
  await promptAndSetEnvironment('production')

  const type = (await p.select({
    message: 'Select way',
    options: [
      { label: 'ID', value: 'id' },
      { label: 'Public ID', value: 'publicId' },
    ],
  })) as 'id' | 'publicId'

  const val = (await p.text({
    message: 'Enter value',
  })) as string

  const prisma = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error'],
  })

  const typebot = await prisma.typebot.findFirst({
    where: {
      [type]: val,
    },
    select: {
      id: true,
      name: true,
      riskLevel: true,
      publicId: true,
      customDomain: true,
      workspace: {
        select: {
          id: true,
          name: true,
          plan: true,
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

  if (!typebot) {
    console.log('Typebot not found')
    return
  }

  console.log(`https://app.typebot.io/typebots/${typebot.id}/edit`)

  console.log(JSON.stringify(typebot, null, 2))
}

inspectTypebot()

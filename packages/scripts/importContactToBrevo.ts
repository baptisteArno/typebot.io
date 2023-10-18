import { PrismaClient } from '@typebot.io/prisma'
import { promptAndSetEnvironment } from './utils'
import got, { HTTPError } from 'got'

const importContactToBrevo = async () => {
  await promptAndSetEnvironment()
  const prisma = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error'],
  })

  prisma.$on('query', (e) => {
    console.log(e.query)
    console.log(e.params)
    console.log(e.duration, 'ms')
  })

  const workspaces = await prisma.workspace.findMany({
    where: {
      plan: { in: ['STARTER', 'PRO'] },
      stripeId: { not: null },
    },
    select: {
      id: true,
      members: {
        where: {
          role: 'ADMIN',
        },
        select: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  })

  console.log('Inserting users', workspaces.flatMap((w) => w.members).length)

  try {
    await got.post('https://api.brevo.com/v3/contacts/import', {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
      },
      json: {
        listIds: [17],
        updateExistingContacts: true,
        jsonBody: workspaces
          .flatMap((workspace) => workspace.members.map((m) => m.user.email))
          .map((email) => ({
            email,
          })),
      },
    })
  } catch (err) {
    if (err instanceof HTTPError) {
      console.log(err.response.body)
      return
    }
    console.log(err)
  }
}

importContactToBrevo()

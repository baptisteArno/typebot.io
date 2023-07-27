import { PrismaClient } from '@typebot.io/prisma'
import { promptAndSetEnvironment } from './utils'
import got, { HTTPError } from 'got'
import { readFileSync } from 'fs'

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
  const users = JSON.parse(readFileSync('users.json').toString()) as {
    email: string
    name: string
  }[]
  console.log('Inserting users', users.length)
  try {
    await got.post('https://api.brevo.com/v3/contacts/import', {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
      },
      json: {
        listIds: [16],
        updateExistingContacts: true,
        jsonBody: users.map((user) => ({
          email: user.email,
          attributes: {
            FIRSTNAME: user.name ? user.name.split(' ')[0] : undefined,
          },
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

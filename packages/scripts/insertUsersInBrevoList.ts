import { PrismaClient } from '@typebot.io/prisma'
import { promptAndSetEnvironment } from './utils'
import ky, { HTTPError } from 'ky'
import { confirm, text, isCancel } from '@clack/prompts'

const insertUsersInBrevoList = async () => {
  await promptAndSetEnvironment('production')

  const listId = await text({
    message: 'List ID?',
  })
  if (!listId || isCancel(listId) || isNaN(listId as unknown as number))
    process.exit()

  const prisma = new PrismaClient()

  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  const users = await prisma.user.findMany({
    where: {
      lastActivityAt: {
        gte: threeMonthsAgo,
      },
      createdAt: {
        lt: oneMonthAgo,
      },
    },
    select: {
      email: true,
    },
  })

  console.log('Inserting users', users.length)

  const proceed = await confirm({ message: 'Proceed?' })
  if (!proceed || typeof proceed !== 'boolean') {
    console.log('Aborting')
    return
  }

  try {
    await ky.post('https://api.brevo.com/v3/contacts/import', {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
      },
      json: {
        listIds: [Number(listId)],
        updateExistingContacts: true,
        jsonBody: users.map((email) => ({
          email,
        })),
      },
    })
  } catch (err) {
    if (err instanceof HTTPError) {
      console.log(await err.response.text())
      return
    }
    console.log(err)
  }
}

insertUsersInBrevoList()

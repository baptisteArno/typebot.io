import { PrismaClient } from '@typebot.io/prisma'
import { promptAndSetEnvironment } from './utils'
import * as p from '@clack/prompts'

const deleteChatSession = async () => {
  await promptAndSetEnvironment('production')

  const id = await p.text({
    message: 'Session ID?',
  })

  if (!id || typeof id !== 'string') {
    console.log('No ID provided')
    return
  }

  const prisma = new PrismaClient()

  const chatSession = await prisma.chatSession.delete({
    where: {
      id,
    },
  })

  console.log(JSON.stringify(chatSession, null, 2))
}

deleteChatSession()

import { PrismaClient } from '@typebot.io/prisma'
import { promptAndSetEnvironment } from './utils'
import * as p from '@clack/prompts'

const inspectChatSession = async () => {
  await promptAndSetEnvironment('production')

  const id = await p.text({
    message: 'Session ID?',
  })

  if (!id || typeof id !== 'string') {
    console.log('No ID provided')
    return
  }

  const prisma = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error'],
  })

  const chatSession = await prisma.chatSession.findFirst({
    where: {
      id,
    },
  })

  if (!chatSession) {
    console.log('Session not found')
    return
  }

  console.log(JSON.stringify(chatSession, null, 2))
}

inspectChatSession()

import { PrismaClient } from '@sniper.io/prisma'
import { promptAndSetEnvironment } from './utils'
import * as p from '@clack/prompts'

const updateSniper = async () => {
  await promptAndSetEnvironment('production')

  const prisma = new PrismaClient()

  const sniperId = await p.text({
    message: 'Sniper ID?',
  })

  if (!sniperId || p.isCancel(sniperId)) process.exit()

  const sniper = await prisma.sniper.update({
    where: {
      id: sniperId,
    },
    data: {
      riskLevel: -1,
    },
  })

  console.log(sniper)
}

updateSniper()

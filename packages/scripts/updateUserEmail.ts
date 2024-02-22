import { PrismaClient } from '@typebot.io/prisma'
import { promptAndSetEnvironment } from './utils'
import { text, isCancel, confirm } from '@clack/prompts'
import { destroyUser } from './helpers/destroyUser'

const updateUserEmail = async () => {
  await promptAndSetEnvironment('production')

  const prisma = new PrismaClient()

  const currentUserEmail = await text({
    message: 'Current email?',
  })

  const newEmail = await text({
    message: 'New email?',
  })

  if (
    !currentUserEmail ||
    !newEmail ||
    isCancel(currentUserEmail) ||
    isCancel(newEmail)
  )
    throw new Error('Invalid emails')

  const existingUserWithNewEmail = await prisma.user.findUnique({
    where: {
      email: newEmail,
    },
  })

  if (existingUserWithNewEmail) {
    console.log(`User with email ${newEmail} already exists`)
    console.log(JSON.stringify(existingUserWithNewEmail, null, 2))

    const isDestroying = await confirm({
      message: 'Would you like to destroy it and update the current user?',
    })

    if (!isDestroying || isCancel(isDestroying)) return

    await destroyUser(newEmail)
  }

  const user = await prisma.user.update({
    where: {
      email: currentUserEmail,
    },
    data: {
      email: newEmail,
    },
  })

  console.log(JSON.stringify(user, null, 2))
}

updateUserEmail()

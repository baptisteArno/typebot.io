import { PrismaClient } from '@typebot.io/prisma'
import { promptAndSetEnvironment } from './utils'
import { isCancel, text } from '@clack/prompts'

const inspectUser = async () => {
  await promptAndSetEnvironment('production')
  const email = await text({
    message: 'User email',
  })

  if (!email || isCancel(email)) process.exit()

  const prisma = new PrismaClient()

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
    select: {
      name: true,
      createdAt: true,
      lastActivityAt: true,
      company: true,
      onboardingCategories: true,
      workspaces: {
        where: {
          role: 'ADMIN',
        },
        select: {
          workspace: {
            select: {
              id: true,
              name: true,
              plan: true,
              isVerified: true,
              members: {
                where: {
                  user: { email: { not: email } },
                },
              },
              additionalStorageIndex: true,
              typebots: {
                orderBy: {
                  updatedAt: 'desc',
                },
                select: {
                  id: true,
                  name: true,
                  createdAt: true,
                  updatedAt: true,
                  riskLevel: true,
                  publishedTypebot: {
                    select: {
                      typebot: {
                        select: { publicId: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  console.log(JSON.stringify(user, null, 2))
}

inspectUser()

import { PrismaClient } from '@typebot.io/prisma'
import { promptAndSetEnvironment } from './utils'
import { isCancel, text, confirm } from '@clack/prompts'

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
              stripeId: true,
              isSuspended: true,
              isPastDue: true,
              members: {
                select: {
                  role: true,
                  user: {
                    select: {
                      email: true,
                    },
                  },
                },
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

  const computeResults = await confirm({
    message: 'Compute collected results?',
  })

  if (!computeResults || isCancel(computeResults)) process.exit()

  console.log('Computing collected results...')

  for (const workspace of user?.workspaces ?? []) {
    for (const typebot of workspace.workspace.typebots) {
      const resultsCount = await prisma.result.count({
        where: {
          typebotId: typebot.id,
          isArchived: false,
          hasStarted: true,
        },
      })

      if (resultsCount === 0) continue

      console.log(
        `Typebot "${typebot.name}" (${typebot.id}) has ${resultsCount} collected results`
      )
    }
  }
}

inspectUser()

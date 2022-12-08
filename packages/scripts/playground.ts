import { Prisma, PrismaClient, User, WorkspaceRole } from 'db'
import { env, isNotEmpty } from 'utils'
import { promptAndSetEnvironment } from './utils'

const executePlayground = async () => {
  await promptAndSetEnvironment()
  const prisma = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error'],
  })

  prisma.$on('query', (e) => {
    console.log(e.query)
    console.log(e.params)
    console.log(e.duration, 'ms')
  })
  const now = new Date()

  const typebot = await prisma.typebot.findFirst({
    where: parseReadFilter('6rw8KvRZe7UbHcJrs8Ui4S', {
      email: '',
      id: 'ckzmhmiey001009mnzt5nkxu8',
    }),
    select: { id: true },
  })

  if (!typebot) return

  const totalViews = await prisma.result.count({
    where: {
      typebotId: {
        in: await filterAuthorizedTypebotIds(
          prisma,
          {
            typebotIds: '6rw8KvRZe7UbHcJrs8Ui4S',
            user: { email: '', id: 'ckzmhmiey001009mnzt5nkxu8' },
          },
          'read'
        ),
      },
    },
  })
  const totalStarts = await prisma.result.count({
    where: {
      typebot: { id: typebot.id },
      answers: { some: {} },
    },
  })
  const totalCompleted = await prisma.result.count({
    where: {
      typebot: { id: typebot.id },
      isCompleted: true,
    },
  })
}

const filterAuthorizedTypebotIds = async (
  prisma: PrismaClient,
  {
    typebotIds,
    user,
  }: {
    typebotIds: string | string[]
    user: Pick<User, 'id' | 'email'>
  },
  role: 'read' | 'write'
) => {
  const typebots = await prisma.typebot.findMany({
    where: {
      id: { in: typebotIds },
      workspace:
        (role === 'read' && user.email === process.env.ADMIN_EMAIL) ||
        isNotEmpty(env('E2E_TEST'))
          ? undefined
          : {
              members: {
                some: {
                  userId: user.id,
                  role:
                    role === 'write' ? { not: WorkspaceRole.GUEST } : undefined,
                },
              },
            },
    },
    select: { id: true },
  })

  return typebots.map((typebot) => typebot.id)
}

executePlayground()

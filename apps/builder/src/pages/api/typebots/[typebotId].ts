import { CollaborationType, CollaboratorsOnTypebots, Prisma, User } from 'db'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, notAuthenticated } from 'utils/api'
import { getAuthenticatedUser } from '@/features/auth/api'
import { archiveResults } from '@/features/results/api'
import { Typebot, typebotSchema } from 'models'
import { captureEvent } from '@sentry/nextjs'
import { isDefined, omit } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)

  const typebotId = req.query.typebotId as string
  if (req.method === 'GET') {
    const typebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
        isArchived: { not: true },
      },
      include: {
        publishedTypebot: true,
        collaborators: { select: { userId: true, type: true } },
        webhooks: true,
      },
    })
    if (!typebot || !(await canReadTypebots(typebot, user)))
      return res.status(404).send({ typebot: null })

    const { publishedTypebot, collaborators, webhooks, ...restOfTypebot } =
      typebot
    const isReadOnly =
      collaborators.find((c) => c.userId === user.id)?.type ===
      CollaborationType.READ
    return res.send({
      typebot: restOfTypebot,
      publishedTypebot,
      isReadOnly,
      webhooks,
    })
  }

  if (req.method === 'DELETE') {
    const typebot = await prisma.typebot.findFirst({
      where: { id: typebotId },
      select: {
        workspaceId: true,
        collaborators: { select: { userId: true, type: true } },
      },
    })
    if (!typebot || !(await canWriteTypebots(typebot, user)))
      return res.status(404).send({ typebot: null })
    const { success } = await archiveResults({
      typebotId,
      user,
      resultsFilter: { typebotId },
    })
    if (!success) return res.status(500).send({ success: false })
    await prisma.publicTypebot.deleteMany({
      where: { typebotId },
    })
    const typebots = await prisma.typebot.updateMany({
      where: { id: typebotId },
      data: { isArchived: true, publicId: null },
    })
    return res.send({ typebots })
  }

  if (req.method === 'PUT') {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const parser = typebotSchema.safeParse({
      ...data,
      updatedAt: new Date(data.updatedAt),
      createdAt: new Date(data.createdAt),
    })
    if ('error' in parser) {
      captureEvent({
        message: 'Typebot schema validation failed',
        extra: {
          typebotId: data.id,
          error: parser.error,
        },
      })
    }

    const typebot = await prisma.typebot.findFirst({
      where: { id: typebotId },
      select: {
        updatedAt: true,
        workspaceId: true,
        collaborators: { select: { userId: true, type: true } },
      },
    })
    if (!typebot || !(await canWriteTypebots(typebot, user)))
      return res.status(404).send({ message: 'Typebot not found' })

    if (typebot.updatedAt > new Date(data.updatedAt))
      return res.send({ message: 'Found newer version of typebot in database' })
    const typebots = await prisma.typebot.updateMany({
      where: { id: typebotId },
      data: removeOldProperties({
        ...data,
        theme: data.theme ?? undefined,
        settings: data.settings ?? undefined,
        resultsTablePreferences: data.resultsTablePreferences ?? undefined,
      }) as Prisma.TypebotUpdateInput,
    })
    return res.send({ typebots })
  }

  if (req.method === 'PATCH') {
    const typebot = await prisma.typebot.findFirst({
      where: { id: typebotId },
      select: {
        updatedAt: true,
        workspaceId: true,
        collaborators: { select: { userId: true, type: true } },
      },
    })
    if (!typebot || !(await canWriteTypebots(typebot, user)))
      return res.status(404).send({ message: 'Typebot not found' })
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const typebots = await prisma.typebot.updateMany({
      where: { id: typebotId },
      data,
    })
    return res.send({ typebots })
  }
  return methodNotAllowed(res)
}

const canReadTypebots = async (
  typebot: Pick<Typebot, 'workspaceId'> & {
    collaborators: Pick<CollaboratorsOnTypebots, 'userId' | 'type'>[]
  },
  user: Pick<User, 'email' | 'id'>
) => {
  if (
    process.env.ADMIN_EMAIL === user.email ||
    typebot.collaborators.find(
      (collaborator) => collaborator.userId === user.id
    )
  )
    return true
  const memberInWorkspace = await prisma.memberInWorkspace.findFirst({
    where: {
      workspaceId: typebot.workspaceId,
      userId: user.id,
    },
  })
  return isDefined(memberInWorkspace)
}

const canWriteTypebots = async (
  typebot: Pick<Typebot, 'workspaceId'> & {
    collaborators: Pick<CollaboratorsOnTypebots, 'userId' | 'type'>[]
  },
  user: Pick<User, 'email' | 'id'>
) => {
  if (
    process.env.ADMIN_EMAIL === user.email ||
    typebot.collaborators.find(
      (collaborator) => collaborator.userId === user.id
    )?.type === CollaborationType.WRITE
  )
    return true
  const memberInWorkspace = await prisma.memberInWorkspace.findFirst({
    where: {
      workspaceId: typebot.workspaceId,
      userId: user.id,
    },
  })
  return memberInWorkspace && memberInWorkspace?.role !== 'GUEST'
}

// TODO: Remove in a month
const removeOldProperties = (data: unknown) => {
  if (data && typeof data === 'object' && 'publishedTypebotId' in data) {
    return omit(data, 'publishedTypebotId')
  }
  return data
}

export default handler

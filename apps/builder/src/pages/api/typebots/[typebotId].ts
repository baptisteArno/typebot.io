import { CollaborationType, Prisma } from 'db'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, notAuthenticated } from 'utils/api'
import { getAuthenticatedUser } from '@/features/auth/api'
import { archiveResults } from '@/features/results/api'
import { Typebot } from 'models'
import { omit } from 'utils'
import { getTypebot } from '@/features/typebot/api/utils/getTypebot'
import { isReadTypebotForbidden } from '@/features/typebot/api/utils/isReadTypebotForbidden'

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
    if (!typebot || (await isReadTypebotForbidden(typebot, user)))
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
    const typebot = (await getTypebot({
      accessLevel: 'write',
      user,
      typebotId,
      select: {
        groups: true,
      },
    })) as Pick<Typebot, 'groups'> | null
    if (!typebot) return res.status(404).send({ typebot: null })
    const { success } = await archiveResults({
      typebot,
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
    const data = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as Typebot

    const typebot = await getTypebot({
      accessLevel: 'write',
      typebotId,
      user,
      select: {
        updatedAt: true,
      },
    })
    if (!typebot) return res.status(404).send({ message: 'Typebot not found' })

    if ((typebot.updatedAt as Date) > new Date(data.updatedAt))
      return res.send({
        message: 'Found newer version of the typebot in database',
      })

    const updates = {
      ...omit(data, 'id', 'createdAt', 'updatedAt'),
      theme: data.theme ?? undefined,
      settings: data.settings ?? undefined,
      resultsTablePreferences: data.resultsTablePreferences ?? undefined,
    } satisfies Prisma.TypebotUpdateInput

    const { count } = await prisma.typebot.updateMany({
      where: { id: typebotId },
      data: updates,
    })
    return res.send({ count })
  }

  if (req.method === 'PATCH') {
    const typebot = await getTypebot({
      accessLevel: 'write',
      typebotId,
      user,
    })
    if (!typebot) return res.status(404).send({ message: 'Typebot not found' })
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const typebots = await prisma.typebot.updateMany({
      where: { id: typebotId },
      data,
    })
    return res.send({ typebots })
  }
  return methodNotAllowed(res)
}

export default handler

import { CollaborationType, Prisma } from '@typebot.io/prisma'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, notAuthenticated } from '@typebot.io/lib/api'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { Typebot } from '@typebot.io/schemas'
import { omit } from '@typebot.io/lib'
import { getTypebot } from '@/features/typebot/helpers/getTypebot'
import { archiveResults } from '@/features/results/helpers/archiveResults'
import { isReadTypebotForbidden } from '@/features/typebot/helpers/isReadTypebotForbidden'
import { removeTypebotOldProperties } from '@/features/typebot/helpers/removeTypebotOldProperties'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)

  const typebotId = req.query.typebotId as string
  if (req.method === 'GET') {
    const fullTypebot = await prisma.typebot.findFirst({
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
    if (!fullTypebot || (await isReadTypebotForbidden(fullTypebot, user)))
      return res.status(404).send({ typebot: null })

    const { publishedTypebot, collaborators, webhooks, ...typebot } =
      fullTypebot
    const isReadOnly =
      collaborators.find((c) => c.userId === user.id)?.type ===
      CollaborationType.READ
    return res.send({
      typebot: removeTypebotOldProperties(typebot),
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
    if (!success) return res.status(500).send({ success: false, error: '' })
    await prisma.publicTypebot.deleteMany({
      where: { typebotId },
    })
    const typebots = await prisma.typebot.updateMany({
      where: { id: typebotId },
      data: { isArchived: true, publicId: null, customDomain: null },
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

    if (
      (typebot.updatedAt as Date).getTime() > new Date(data.updatedAt).getTime()
    )
      return res.send({
        message: 'Found newer version of the typebot in database',
      })

    const updates = {
      ...omit(data, 'id', 'createdAt', 'updatedAt'),
      version: '3',
      theme: data.theme ?? undefined,
      settings: data.settings ?? undefined,
      resultsTablePreferences: data.resultsTablePreferences ?? undefined,
      groups: data.groups ?? [],
      variables: data.variables ?? [],
      edges: data.edges ?? [],
    } satisfies Prisma.TypebotUpdateInput

    try {
      const updatedTypebot = await prisma.typebot.update({
        where: { id: typebotId },
        data: updates,
      })
      return res.send({ typebot: updatedTypebot })
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          return res.status(409).send({
            message:
              err.meta && 'target' in err.meta && Array.isArray(err.meta.target)
                ? `${err.meta.target[0]} already exists`
                : 'Duplicate conflict',
          })
        }
        return res.status(500).send({ message: err.message })
      }
    }
  }

  if (req.method === 'PATCH') {
    const typebot = await getTypebot({
      accessLevel: 'write',
      typebotId,
      user,
    })
    if (!typebot) return res.status(404).send({ message: 'Typebot not found' })
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const updatedTypebot = await prisma.typebot.update({
      where: { id: typebotId },
      data,
    })
    return res.send({ typebot: updatedTypebot })
  }
  return methodNotAllowed(res)
}

export default handler

import { Typebot, WebhookBlock } from '@typebot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from '@typebot.io/lib/api'
import { byId } from '@typebot.io/lib'
import prisma from '@/lib/prisma'
import { authenticateUser } from '@/helpers/authenticateUser'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await authenticateUser(req)
  if (!user) return res.status(401).json({ message: 'Not authenticated' })
  if (req.method === 'POST') {
    const body = req.body as Record<string, string>
    if (!('url' in body))
      return res.status(403).send({ message: 'url is missing in body' })
    const { url } = body
    const typebotId = req.query.typebotId as string
    const groupId = req.query.groupId as string
    const blockId = req.query.blockId as string
    const typebot = (await prisma.typebot.findFirst({
      where: {
        id: typebotId,
        workspace: { members: { some: { userId: user.id } } },
      },
    })) as unknown as Typebot | undefined
    if (!typebot) return res.status(400).send({ message: 'Typebot not found' })
    try {
      const { webhookId } = typebot.groups
        .find(byId(groupId))
        ?.blocks.find(byId(blockId)) as WebhookBlock
      await prisma.webhook.upsert({
        where: { id: webhookId },
        update: { url, body: '{{state}}', method: 'POST' },
        create: {
          url,
          body: '{{state}}',
          method: 'POST',
          typebotId,
          headers: [],
          queryParams: [],
        },
      })

      return res.send({ message: 'success' })
    } catch (err) {
      return res
        .status(400)
        .send({ message: "blockId doesn't point to a Webhook block" })
    }
  }
  return methodNotAllowed(res)
}

export default handler

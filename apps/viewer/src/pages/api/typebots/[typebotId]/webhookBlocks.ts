import { authenticateUser } from '@/helpers/authenticateUser'
import prisma from '@/lib/prisma'
import { Group, WebhookBlock } from '@typebot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { byId, isWebhookBlock, parseGroupTitle } from '@typebot.io/lib'
import { methodNotAllowed } from '@typebot.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await authenticateUser(req)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })
    const typebotId = req.query.typebotId as string
    const typebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
        workspace: { members: { some: { userId: user.id } } },
      },
      select: { groups: true, webhooks: true },
    })
    const emptyWebhookBlocks = (typebot?.groups as Group[]).reduce<
      { blockId: string; name: string; url: string | undefined }[]
    >((emptyWebhookBlocks, group) => {
      const blocks = group.blocks.filter((block) =>
        isWebhookBlock(block)
      ) as WebhookBlock[]
      return [
        ...emptyWebhookBlocks,
        ...blocks.map((b) => ({
          blockId: b.id,
          name: `${parseGroupTitle(group.title)} > ${b.id}`,
          url: typebot?.webhooks.find(byId(b.webhookId))?.url ?? undefined,
        })),
      ]
    }, [])
    return res.send({ blocks: emptyWebhookBlocks })
  }
  return methodNotAllowed(res)
}

export default handler

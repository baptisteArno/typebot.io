import { authenticateUser } from '@/helpers/authenticateUser'
import prisma from '@sniper.io/lib/prisma'
import { Group, HttpRequestBlock } from '@sniper.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { isWebhookBlock } from '@sniper.io/schemas/helpers'
import { methodNotAllowed } from '@sniper.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await authenticateUser(req)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })
    const sniperId = req.query.sniperId as string
    const sniper = await prisma.sniper.findFirst({
      where: {
        id: sniperId,
        workspace: { members: { some: { userId: user.id } } },
      },
      select: { groups: true, webhooks: true },
    })
    const emptyWebhookBlocks = (sniper?.groups as Group[]).reduce<
      { blockId: string; name: string; url: string | undefined }[]
    >((emptyWebhookBlocks, group) => {
      const blocks = group.blocks.filter((block) =>
        isWebhookBlock(block)
      ) as HttpRequestBlock[]
      return [
        ...emptyWebhookBlocks,
        ...blocks.map((b) => ({
          blockId: b.id,
          name: `${group.title} > ${b.id}`,
          url:
            sniper?.webhooks.find((w) => {
              if ('id' in w && 'webhookId' in b) return w.id === b.webhookId
              return false
            })?.url ?? undefined,
        })),
      ]
    }, [])
    return res.send({ blocks: emptyWebhookBlocks })
  }
  return methodNotAllowed(res)
}

export default handler

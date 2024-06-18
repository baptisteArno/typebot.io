import { authenticateUser } from '@/helpers/authenticateUser'
import prisma from '@sniper.io/lib/prisma'
import { Group } from '@sniper.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { isNotDefined } from '@sniper.io/lib'
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
      { groupId: string; id: string; name: string }[]
    >((emptyWebhookBlocks, group) => {
      const blocks = group.blocks.filter(
        (block) =>
          isWebhookBlock(block) &&
          isNotDefined(
            sniper?.webhooks.find((w) => {
              if ('id' in w && 'webhookId' in block)
                return w.id === block.webhookId
              return false
            })?.url
          )
      )
      return [
        ...emptyWebhookBlocks,
        ...blocks.map((b) => ({
          id: b.id,
          groupId: group.id,
          name: `${group.title} > ${b.id}`,
        })),
      ]
    }, [])
    return res.send({ steps: emptyWebhookBlocks })
  }
  return methodNotAllowed(res)
}

export default handler

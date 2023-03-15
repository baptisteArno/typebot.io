import prisma from '@/lib/prisma'
import {
  defaultWebhookAttributes,
  ResultValues,
  Typebot,
  Variable,
  Webhook,
  WebhookOptions,
  WebhookBlock,
} from '@typebot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { initMiddleware, methodNotAllowed, notFound } from '@typebot.io/lib/api'
import { byId } from '@typebot.io/lib'
import Cors from 'cors'
import { executeWebhook } from '../../executeWebhook'

const cors = initMiddleware(Cors())

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method === 'POST') {
    const typebotId = req.query.typebotId as string
    const groupId = req.query.groupId as string
    const blockId = req.query.blockId as string
    const resultId = req.query.resultId as string | undefined
    const { resultValues, variables, parentTypebotIds } = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as {
      resultValues: ResultValues
      variables: Variable[]
      parentTypebotIds: string[]
    }
    const typebot = (await prisma.typebot.findUnique({
      where: { id: typebotId },
      include: { webhooks: true },
    })) as unknown as (Typebot & { webhooks: Webhook[] }) | null
    if (!typebot) return notFound(res)
    const block = typebot.groups
      .find(byId(groupId))
      ?.blocks.find(byId(blockId)) as WebhookBlock
    const webhook = typebot.webhooks.find(byId(block.webhookId))
    if (!webhook)
      return res
        .status(404)
        .send({ statusCode: 404, data: { message: `Couldn't find webhook` } })
    const preparedWebhook = prepareWebhookAttributes(webhook, block.options)
    const result = await executeWebhook(typebot)({
      webhook: preparedWebhook,
      variables,
      groupId,
      resultValues,
      resultId,
      parentTypebotIds,
    })
    return res.status(200).send(result)
  }
  return methodNotAllowed(res)
}

const prepareWebhookAttributes = (
  webhook: Webhook,
  options: WebhookOptions
): Webhook => {
  if (options.isAdvancedConfig === false) {
    return { ...webhook, body: '{{state}}', ...defaultWebhookAttributes }
  } else if (options.isCustomBody === false) {
    return { ...webhook, body: '{{state}}' }
  }
  return webhook
}

export default handler

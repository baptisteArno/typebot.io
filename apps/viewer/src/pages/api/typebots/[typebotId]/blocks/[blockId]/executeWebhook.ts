/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ResultValues,
  Sniper,
  Variable,
  HttpRequest,
  Block,
  PublicSniper,
  AnswerInSessionState,
} from '@sniper.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { byId } from '@sniper.io/lib'
import { isWebhookBlock } from '@sniper.io/schemas/helpers'
import { initMiddleware, methodNotAllowed, notFound } from '@sniper.io/lib/api'
import Cors from 'cors'
import prisma from '@sniper.io/lib/prisma'
import { getBlockById } from '@sniper.io/schemas/helpers'
import {
  executeWebhook,
  parseWebhookAttributes,
} from '@sniper.io/bot-engine/blocks/integrations/webhook/executeWebhookBlock'
import { fetchLinkedParentSnipers } from '@sniper.io/bot-engine/blocks/logic/sniperLink/fetchLinkedParentSnipers'
import { fetchLinkedChildSnipers } from '@sniper.io/bot-engine/blocks/logic/sniperLink/fetchLinkedChildSnipers'
import { parseSampleResult } from '@sniper.io/bot-engine/blocks/integrations/webhook/parseSampleResult'
import { saveLog } from '@sniper.io/bot-engine/logs/saveLog'
import { authenticateUser } from '@/helpers/authenticateUser'

const cors = initMiddleware(Cors())

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method === 'POST') {
    const user = await authenticateUser(req)
    const sniperId = req.query.sniperId as string
    const blockId = req.query.blockId as string
    const resultId = req.query.resultId as string | undefined
    const { resultValues, variables, parentSniperIds } = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as {
      resultValues: ResultValues
      variables: Variable[]
      parentSniperIds: string[]
    }
    const sniper = (await prisma.sniper.findUnique({
      where: { id: sniperId },
      include: { webhooks: true },
    })) as unknown as (Sniper & { webhooks: HttpRequest[] }) | null
    if (!sniper) return notFound(res)
    const block = sniper.groups
      .flatMap<Block>((g) => g.blocks)
      .find(byId(blockId))
    if (!block || !isWebhookBlock(block))
      return notFound(res, 'Webhook block not found')
    const webhookId = 'webhookId' in block ? block.webhookId : undefined
    const webhook =
      block.options?.webhook ??
      sniper.webhooks.find((w) => {
        if ('id' in w) return w.id === webhookId
        return false
      })
    if (!webhook)
      return res
        .status(404)
        .send({ statusCode: 404, data: { message: `Couldn't find webhook` } })
    const { group } = getBlockById(blockId, sniper.groups)
    const linkedSnipersParents = (await fetchLinkedParentSnipers({
      isPreview: !('sniperId' in sniper),
      parentSniperIds,
      userId: user?.id,
    })) as (Sniper | PublicSniper)[]
    const linkedSnipersChildren = await fetchLinkedChildSnipers({
      isPreview: !('sniperId' in sniper),
      snipers: [sniper],
      userId: user?.id,
    })([])

    const linkedSnipers = [...linkedSnipersParents, ...linkedSnipersChildren]

    const answers = resultValues
      ? resultValues.answers.map((answer: any) => ({
          key:
            (answer.variableId
              ? sniper.variables.find(
                  (variable) => variable.id === answer.variableId
                )?.name
              : sniper.groups.find((group) =>
                  group.blocks.find((block) => block.id === answer.blockId)
                )?.title) ?? '',
          value: answer.content,
        }))
      : arrayify(
          await parseSampleResult(sniper, linkedSnipers)(group.id, variables)
        )

    const parsedWebhook = await parseWebhookAttributes({
      webhook,
      isCustomBody: block.options?.isCustomBody,
      sniper: {
        ...sniper,
        variables: sniper.variables.map((v) => {
          const matchingVariable = variables.find(byId(v.id))
          if (!matchingVariable) return v
          return { ...v, value: matchingVariable.value }
        }),
      },
      answers,
    })

    if (!parsedWebhook)
      return res.status(500).send({
        statusCode: 500,
        data: { message: `Couldn't parse webhook attributes` },
      })

    const { response, logs } = await executeWebhook(parsedWebhook, {
      timeout: block.options?.timeout,
    })

    if (resultId)
      await Promise.all(
        logs?.map((log) =>
          saveLog({
            message: log.description,
            details: log.details,
            status: log.status as 'error' | 'success' | 'info',
            resultId,
          })
        ) ?? []
      )

    return res.status(200).send(response)
  }
  return methodNotAllowed(res)
}

const arrayify = (
  obj: Record<string, string | boolean | undefined>
): AnswerInSessionState[] =>
  Object.entries(obj)
    .map(([key, value]) => ({ key, value: value?.toString() }))
    .filter((a) => a.value) as AnswerInSessionState[]

export default handler

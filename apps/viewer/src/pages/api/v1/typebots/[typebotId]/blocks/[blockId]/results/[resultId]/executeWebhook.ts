import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import {
  badRequest,
  conflict,
  forbidden,
  initMiddleware,
  internalServerError,
  methodNotAllowed,
  notFound,
} from '@typebot.io/lib/api'
import { resumeWebhookListener } from '@typebot.io/bot-engine/apiHandlers/resumeWebhookListener'
import {
  authenticateWebhookCaller,
  parseWebhookBody,
} from '@/features/webhook/helpers/authenticateWebhookCaller'

const cors = initMiddleware(Cors())

/**
 * POST /api/v1/typebots/{typebotId}/blocks/{blockId}/results/{resultId}/executeWebhook
 *
 * Callback URL of a Webhook listener block. An external service calls this to
 * release a conversation that is waiting on the block. The posted JSON body is
 * exposed to the block's variable mappings as `data`.
 *
 * Requires `Authorization: Bearer <API token>`.
 *
 * On success it returns the resumed chat chunk (messages / input /
 * clientSideActions), in the same shape as `continueChat`, so the caller can
 * relay it to the end user.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method !== 'POST') return methodNotAllowed(res)

  const typebotId = req.query.typebotId as string
  const blockId = req.query.blockId as string
  const resultId = req.query.resultId as string

  const auth = await authenticateWebhookCaller(req, { typebotId, blockId })
  if (auth.status === 'error') {
    if (auth.code === 'FORBIDDEN') return forbidden(res, auth.message)
    if (auth.code === 'BAD_REQUEST') return badRequest(res, auth.message)
    return notFound(res, auth.message)
  }

  const result = await resumeWebhookListener({
    typebotId,
    resultId,
    blockId,
    body: parseWebhookBody(req),
  })

  if (result.status === 'error') {
    if (result.code === 'NOT_FOUND') return notFound(res, result.message)
    if (result.code === 'CONFLICT') return conflict(res, result.message)
    return internalServerError(res, result.message)
  }

  return res.status(200).json(result.response)
}

export default handler

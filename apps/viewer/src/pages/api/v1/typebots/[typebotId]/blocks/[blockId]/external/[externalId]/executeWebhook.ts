import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import { byId } from '@typebot.io/lib'
import {
  badRequest,
  forbidden,
  initMiddleware,
  methodNotAllowed,
  notFound,
} from '@typebot.io/lib/api'
import { triggerOrResumeWebhookByExternalId } from '@typebot.io/bot-engine/apiHandlers/triggerOrResumeWebhookByExternalId'
import {
  authenticateWebhookCaller,
  parseWebhookBody,
} from '@/features/webhook/helpers/authenticateWebhookCaller'

const cors = initMiddleware(Cors())

const MAX_EXTERNAL_ID_LENGTH = 200

/**
 * POST /api/v1/typebots/{typebotId}/blocks/{blockId}/external/{externalId}/executeWebhook
 *
 * Callback URL of a Webhook listener block, addressed by a caller-chosen
 * `externalId` (a phone number, a lead ID — anything that identifies this
 * contact in your own system) instead of a typebot-issued resultId.
 *
 * - First call with a given `externalId`: starts a brand-new conversation,
 *   entering directly at the group this block connects to.
 * - Later calls with the SAME `externalId`: resume that conversation, feeding
 *   the posted body in as the next reply, wherever it currently is.
 *
 * Requires `Authorization: Bearer <WEBHOOK_TOKEN>`.
 *
 * Returns the resulting chat chunk (messages / input / clientSideActions), in
 * the same shape as `continueChat`, so the caller can relay it to the end
 * user.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method !== 'POST') return methodNotAllowed(res)

  const typebotId = req.query.typebotId as string
  const blockId = req.query.blockId as string
  const externalId = req.query.externalId as string

  if (!externalId || externalId.length > MAX_EXTERNAL_ID_LENGTH)
    return badRequest(
      res,
      `externalId is required and must be at most ${MAX_EXTERNAL_ID_LENGTH} characters`
    )

  const auth = await authenticateWebhookCaller(req, { typebotId, blockId })
  if (auth.status === 'error') {
    if (auth.code === 'FORBIDDEN') return forbidden(res, auth.message)
    if (auth.code === 'BAD_REQUEST') return badRequest(res, auth.message)
    return notFound(res, auth.message)
  }

  const groupId = auth.edges.find(byId(auth.block.outgoingEdgeId))?.to.groupId

  const result = await triggerOrResumeWebhookByExternalId({
    typebotId,
    blockId,
    externalId,
    body: parseWebhookBody(req),
    startContext: {
      publicId: auth.publicId,
      groupId,
      responseVariableMapping: auth.block.options?.responseVariableMapping,
      externalIdVariableId: auth.block.options?.externalIdVariableId,
      variables: auth.variables,
    },
  })

  if (result.status === 'error') return badRequest(res, result.message)

  return res.status(200).json(result.response)
}

export default handler

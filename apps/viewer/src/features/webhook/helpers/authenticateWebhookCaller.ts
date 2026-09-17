import { timingSafeEqual } from 'crypto'
import { env } from '@typebot.io/env'
import prisma from '@typebot.io/lib/prisma'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import { WebhookBlock, Edge, Variable } from '@typebot.io/schemas'
import { parseGroups } from '@typebot.io/schemas/features/typebot/group'
import { edgeSchema } from '@typebot.io/schemas/features/typebot/edge'
import { variableSchema } from '@typebot.io/schemas/features/typebot/variable'
import { byId } from '@typebot.io/lib'
import { NextApiRequest } from 'next'
import { z } from 'zod'

type AuthenticateResult =
  | {
      status: 'ok'
      block: WebhookBlock
      edges: Edge[]
      variables: Variable[]
      publicId: string | null
    }
  | {
      status: 'error'
      code: 'FORBIDDEN' | 'NOT_FOUND' | 'BAD_REQUEST'
      message: string
    }

const stripBearer = (value: string) => value.replace(/^Bearer\s+/i, '').trim()

/**
 * Compares two secrets without leaking their contents through timing. Lengths
 * are compared first because timingSafeEqual throws on a length mismatch — that
 * only reveals the length, not the value.
 */
const isSameSecret = (received: string, expected: string) => {
  const a = Buffer.from(received)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/**
 * Authorizes a call to a Webhook listener callback URL against the static
 * `WEBHOOK_TOKEN` secret, then checks the addressed block really is a Webhook
 * listener on a v6 typebot.
 *
 * The header may be sent with or without the `Bearer ` prefix, and
 * `WEBHOOK_TOKEN` may be configured either way — both sides are normalised.
 */
export const authenticateWebhookCaller = async (
  req: NextApiRequest,
  { typebotId, blockId }: { typebotId: string; blockId: string }
): Promise<AuthenticateResult> => {
  const providedToken = req.headers['authorization']
  if (
    typeof providedToken !== 'string' ||
    !isSameSecret(stripBearer(providedToken), stripBearer(env.WEBHOOK_TOKEN))
  )
    return {
      status: 'error',
      code: 'FORBIDDEN',
      message: 'Invalid webhook token',
    }

  const typebot = await prisma.typebot.findUnique({
    where: { id: typebotId },
    select: {
      version: true,
      groups: true,
      edges: true,
      variables: true,
      publicId: true,
    },
  })

  if (!typebot)
    return { status: 'error', code: 'NOT_FOUND', message: 'Typebot not found' }

  if (typebot.version !== '6')
    return {
      status: 'error',
      code: 'BAD_REQUEST',
      message: 'Webhook blocks are only available on version 6 typebots',
    }

  const block = parseGroups(typebot.groups, {
    typebotVersion: typebot.version,
  })
    .flatMap((group) => group.blocks)
    .find(byId(blockId))

  if (!block || block.type !== LogicBlockType.WEBHOOK)
    return {
      status: 'error',
      code: 'NOT_FOUND',
      message: 'Webhook block not found',
    }

  return {
    status: 'ok',
    block,
    edges: z.array(edgeSchema).parse(typebot.edges),
    variables: z.array(variableSchema).parse(typebot.variables),
    publicId: typebot.publicId,
  }
}

/**
 * Next parses JSON bodies for us, but a `text/plain` or absent content type
 * arrives as a string, and an empty body must stay empty rather than blow up.
 */
export const parseWebhookBody = (req: NextApiRequest): unknown => {
  if (!req.body) return undefined
  if (typeof req.body !== 'string') return req.body
  try {
    return JSON.parse(req.body)
  } catch (err) {
    return req.body
  }
}

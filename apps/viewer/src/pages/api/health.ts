import { NextApiRequest, NextApiResponse } from 'next'
import {
  initGraceful,
  isDraining,
  healthSnapshot,
  beginRequest,
} from '@typebot.io/lib'
import { startBotFlow } from '@typebot.io/bot-engine/startBotFlow'
import { SessionState, TypebotInSession } from '@typebot.io/schemas'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'

import { EventType } from '@typebot.io/schemas/features/events/constants'

initGraceful({ component: 'viewer' })

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const end = beginRequest({ kind: 'probe', track: false })
  res.setHeader('Cache-Control', 'no-store')
  if (isDraining()) {
    const snap = healthSnapshot()
    end()
    return res.status(503).json(snap)
  }
  if (req.query.mode === 'deep') {
    const isHealthy = await checkResponsiveness()
    if (!isHealthy) {
      end()
      return res.status(503).json({ status: 'unhealthy' })
    }
  }

  const snap = healthSnapshot()
  end()
  return res.status(200).json(snap)
}

const checkResponsiveness = async () => {
  const mockTypebot: TypebotInSession = {
    version: '6',
    id: 'health-check',
    typebotId: 'health-check-id',
    groups: [
      {
        id: 'group1',
        title: 'Group 1',
        graphCoordinates: { x: 0, y: 0 },
        blocks: [
          {
            id: 'block1',
            type: LogicBlockType.SCRIPT,
            options: {
              content: 'return "OK"',
            },
          },
          {
            id: 'block2',
            type: BubbleBlockType.TEXT,
            content: {
              richText: [
                { type: 'p', children: [{ text: 'Health Check OK' }] },
              ],
            },
          },
        ],
      },
    ],
    events: [
      {
        id: 'start1',
        graphCoordinates: { x: 0, y: 0 },
        type: EventType.START,
        outgoingEdgeId: 'edge1',
      },
    ],
    edges: [
      {
        id: 'edge1',
        from: { eventId: 'start1' },
        to: { groupId: 'group1' },
      },
    ],
    variables: [],
  }

  const sessionState: SessionState = {
    version: '3',
    typebotsQueue: [
      {
        typebot: mockTypebot,
        answers: [],
        resultId: undefined,
        isMergingWithParent: false,
      },
    ],
  }

  try {
    const response = await startBotFlow({
      version: 2,
      state: sessionState,
      textBubbleContentFormat: 'markdown',
      startFrom: { type: 'event', eventId: 'start1' },
    })
    const hasMessage = response.messages.some(
      (m) => m.content && JSON.stringify(m.content).includes('Health Check OK')
    )
    return hasMessage
  } catch (err) {
    console.error('Health check failed', err)
    return false
  }
}

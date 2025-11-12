import { NextApiRequest, NextApiResponse } from 'next'
import {
  initGraceful,
  isDraining,
  healthSnapshot,
  beginRequest,
} from '@typebot.io/lib'

// Initialize once per process; component name aids log filtering.
initGraceful({ component: 'builder' })

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const end = beginRequest({ kind: 'probe', track: false })
  // Prevent any intermediary caching; health must reflect real-time state.
  res.setHeader('Cache-Control', 'no-store')
  if (isDraining()) {
    const snap = healthSnapshot()
    end()
    return res.status(503).json(snap)
  }
  const snap = healthSnapshot()
  end()
  return res.status(200).json(snap)
}

import { NextApiRequest, NextApiResponse } from 'next'
import { triggerDrain } from '@typebot.io/lib'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
  triggerDrain()
  return res.status(202).json({ status: 'draining' })
}

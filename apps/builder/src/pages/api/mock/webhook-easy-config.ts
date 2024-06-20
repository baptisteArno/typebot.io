import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from '@sniper.io/lib/api'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return res.status(200).send(req.body)
  }
  return methodNotAllowed(res)
}

export default handler

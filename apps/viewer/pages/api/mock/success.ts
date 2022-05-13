import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from 'utils'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return res.status(200).json({
      statusCode: 200,
      statusMessage: 'OK',
    })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)

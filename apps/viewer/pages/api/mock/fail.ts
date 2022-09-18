import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from 'utils/api'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return res.status(500).json({
      statusCode: 500,
      statusMessage: 'Fail',
    })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)

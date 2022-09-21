import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from 'utils'

const config = {
  basePath: process.env.BASE_PATH,
  environment: process.env.NODE_ENV_OCTADESK,
  viewerURL: process.env.NEXT_PUBLIC_VIEWER_URL
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return res.send(config)
  }

  return methodNotAllowed(res)
}

export default withSentry(handler)

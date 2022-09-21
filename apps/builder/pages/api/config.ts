import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return res.send({
      local: process.env.IS_LOCAL === 'true',
      basePath: process.env.IS_LOCAL === 'true' ? '' : '/embed/builder',
      environment: process.env.NODE_ENV_OCTADESK === undefined ? 'production' : process.env.NODE_ENV_OCTADESK,
      viewerURL: process.env.IS_LOCAL === 'true' ? process.env.NEXT_PUBLIC_VIEWER_URL ? process.env.NEXT_PUBLIC_VIEWER_URL : '' : '/embed/viewer',
    })
  }
  
  return methodNotAllowed(res)
}

export default withSentry(handler)

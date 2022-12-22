import { appRouter } from '@/utils/server/routers/v1/_app'
import { captureException } from '@sentry/nextjs'
import { createOpenApiNextHandler } from 'trpc-openapi'
import cors from 'nextjs-cors'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res, {
    origin: ['https://docs.typebot.io', 'http://localhost:3005'],
  })

  return createOpenApiNextHandler({
    router: appRouter,
    onError({ error }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        captureException(error)
        console.error('Something went wrong', error)
      }
    },
  })(req, res)
}
export default handler

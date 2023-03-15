import { createContext } from '@/helpers/server/context'
import { trpcRouter } from '@/helpers/server/routers/v1/trpcRouter'
import { captureException } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { createOpenApiNextHandler } from 'trpc-openapi'
import cors from 'nextjs-cors'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res, {
    origin: ['https://docs.typebot.io', 'http://localhost:3000'],
  })

  return createOpenApiNextHandler({
    router: trpcRouter,
    createContext,
    onError({ error }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        captureException(error)
        console.error('Something went wrong', error)
      }
    },
  })(req, res)
}
export default handler

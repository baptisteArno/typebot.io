import Cors from 'micro-cors'
import { RequestHandler } from 'next/dist/server/next'
import { webhookHandler } from '@typebot.io/billing/api/webhookHandler'

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default cors(webhookHandler as RequestHandler)

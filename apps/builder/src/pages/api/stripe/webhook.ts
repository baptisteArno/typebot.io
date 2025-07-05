import Cors from 'micro-cors'
import { RequestHandler } from 'next/dist/server/next'

// This is a placeholder for the actual webhook handler logic
const webhookHandler: RequestHandler = async () => {}

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default cors(webhookHandler as RequestHandler)

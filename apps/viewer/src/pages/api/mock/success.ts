import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from 'utils/api'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return res.status(200).json({
      statusCode: 200,
      statusMessage: 'OK',
    })
  }
  methodNotAllowed(res)
}

export default handler

import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PATCH') {
    const data = JSON.parse(req.body)
    const id = req.query.id.toString()
    const result = await prisma.result.update({
      where: { id },
      data,
    })
    return res.send(result)
  }
  return methodNotAllowed(res)
}

export default handler

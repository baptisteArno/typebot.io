import prisma from '@typebot.io/lib/prisma'
import { Answer } from '@typebot.io/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from '@typebot.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PUT') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { uploadedFiles, ...answer } = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as Answer & { uploadedFiles: string[] }
    const result = await prisma.answer.createMany({
      data: [{ ...answer }],
    })
    return res.send(result)
  }
  return methodNotAllowed(res)
}

export default handler

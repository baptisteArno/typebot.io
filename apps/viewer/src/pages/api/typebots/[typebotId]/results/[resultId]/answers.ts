import prisma from '@/lib/prisma'
import { Answer } from '@typebot.io/prisma'
import { got } from 'got'
import { NextApiRequest, NextApiResponse } from 'next'
import { isNotDefined } from '@typebot.io/lib'
import { methodNotAllowed } from '@typebot.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PUT') {
    const { uploadedFiles, ...answer } = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as Answer & { uploadedFiles?: boolean }
    let storageUsed = 0
    if (uploadedFiles && answer.content.includes('http')) {
      const fileUrls = answer.content.split(', ')
      const hasReachedStorageLimit = fileUrls[0] === null
      if (!hasReachedStorageLimit) {
        for (const url of fileUrls) {
          const { headers } = await got(url)
          const size = headers['content-length']
          if (isNotDefined(size)) return
          storageUsed += parseInt(size, 10)
        }
      }
    }
    const result = await prisma.answer.upsert({
      where: {
        resultId_blockId_groupId: {
          resultId: answer.resultId,
          groupId: answer.groupId,
          blockId: answer.blockId,
        },
      },
      create: { ...answer, storageUsed: storageUsed > 0 ? storageUsed : null },
      update: { ...answer, storageUsed: storageUsed > 0 ? storageUsed : null },
    })
    return res.send(result)
  }
  return methodNotAllowed(res)
}

export default handler

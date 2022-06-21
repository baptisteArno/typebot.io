import { withSentry } from '@sentry/nextjs'
import prisma from 'libs/prisma'
import { InputBlockType, PublicTypebot } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { badRequest, generatePresignedUrl, methodNotAllowed, byId } from 'utils'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'GET') {
    if (
      !process.env.S3_ENDPOINT ||
      !process.env.S3_ACCESS_KEY ||
      !process.env.S3_SECRET_KEY
    )
      return badRequest(
        res,
        'S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY'
      )
    const filePath = req.query.filePath as string | undefined
    const fileType = req.query.fileType as string | undefined
    const typebotId = req.query.typebotId as string
    const blockId = req.query.blockId as string
    if (!filePath || !fileType) return badRequest(res)
    const typebot = (await prisma.publicTypebot.findFirst({
      where: { typebotId },
    })) as unknown as PublicTypebot
    const fileUploadBlock = typebot.groups
      .flatMap((g) => g.blocks)
      .find(byId(blockId))
    if (fileUploadBlock?.type !== InputBlockType.FILE) return badRequest(res)
    const sizeLimit = fileUploadBlock.options.sizeLimit
      ? Math.min(fileUploadBlock.options.sizeLimit, 500)
      : 10

    const presignedUrl = generatePresignedUrl({
      fileType,
      filePath,
      sizeLimit: sizeLimit * 1024 * 1024,
    })

    return res.status(200).send({ presignedUrl })
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)

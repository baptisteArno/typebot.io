import { withSentry } from '@sentry/nextjs'
import { Client } from 'minio'
import { NextApiRequest, NextApiResponse } from 'next'
//import { getSession } from 'next-auth/react'
import { badRequest, methodNotAllowed } from 'utils'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'GET') {
    const session = null //await getSession({ req })
    if (!session) {
      res.status(401)
      return
    }

    if (
      !process.env.S3_ENDPOINT ||
      !process.env.S3_ACCESS_KEY ||
      !process.env.S3_SECRET_KEY
    )
      return res.send({
        message:
          'S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY',
      })

    const s3 = new Client({
      endPoint: process.env.S3_ENDPOINT,
      port: process.env.S3_PORT ? Number(process.env.S3_PORT) : undefined,
      useSSL:
        process.env.S3_SSL && process.env.S3_SSL === 'false' ? false : true,
      accessKey: process.env.S3_ACCESS_KEY,
      secretKey: process.env.S3_SECRET_KEY,
      region: process.env.S3_REGION,
    })

    const filePath = req.query.filePath as string | undefined
    if (!filePath) return badRequest(res)
    const presignedUrl = await s3.presignedPutObject(
      process.env.S3_BUCKET ?? 'typebot',
      filePath
    )

    return res.status(200).send({ presignedUrl })
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)

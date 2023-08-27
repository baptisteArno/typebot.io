import { env } from '@typebot.io/env'
import { config, Endpoint, S3 } from 'aws-sdk'

type GeneratePresignedUrlProps = {
  filePath: string
  fileType?: string
  sizeLimit?: number
}

const tenMB = 10 * 1024 * 1024
const tenMinutes = 10 * 60

export const generatePresignedUrl = ({
  filePath,
  fileType,
  sizeLimit = tenMB,
}: GeneratePresignedUrlProps): S3.PresignedPost => {
  if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY)
    throw new Error(
      'S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY'
    )

  config.update({
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
    region: env.S3_REGION,
    sslEnabled: env.S3_SSL,
  })
  const protocol = env.S3_SSL ? 'https' : 'http'
  const s3 = new S3({
    endpoint: new Endpoint(
      `${protocol}://${env.S3_ENDPOINT}${env.S3_PORT ? `:${env.S3_PORT}` : ''}`
    ),
  })

  const presignedUrl = s3.createPresignedPost({
    Bucket: env.S3_BUCKET ?? 'typebot',
    Fields: {
      key: filePath,
      'Content-Type': fileType,
    },
    Expires: tenMinutes,
    Conditions: [['content-length-range', 0, sizeLimit]],
  })
  return presignedUrl
}

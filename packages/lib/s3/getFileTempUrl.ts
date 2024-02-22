import { env } from '@typebot.io/env'
import { Client } from 'minio'

type Props = {
  key: string
  expires?: number
}
export const getFileTempUrl = async ({
  key,
  expires,
}: Props): Promise<string> => {
  if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY)
    throw new Error(
      'S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY'
    )

  const minioClient = new Client({
    endPoint: env.S3_ENDPOINT,
    port: env.S3_PORT,
    useSSL: env.S3_SSL,
    accessKey: env.S3_ACCESS_KEY,
    secretKey: env.S3_SECRET_KEY,
    region: env.S3_REGION,
  })

  return minioClient.presignedGetObject(env.S3_BUCKET, key, expires ?? 3600)
}

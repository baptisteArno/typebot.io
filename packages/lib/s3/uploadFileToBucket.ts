import { env } from '@typebot.io/env'
import { Client } from 'minio'

type Props = {
  key: string
  file: Buffer
  mimeType: string
}

export const uploadFileToBucket = async ({
  key,
  file,
  mimeType,
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

  await minioClient.putObject(env.S3_BUCKET, 'public/' + key, file, {
    'Content-Type': mimeType,
    'Cache-Control': 'public, max-age=86400',
  })

  return env.S3_PUBLIC_CUSTOM_DOMAIN
    ? `${env.S3_PUBLIC_CUSTOM_DOMAIN}/public/${key}`
    : `http${env.S3_SSL ? 's' : ''}://${env.S3_ENDPOINT}${
        env.S3_PORT ? `:${env.S3_PORT}` : ''
      }/${env.S3_BUCKET}/public/${key}`
}

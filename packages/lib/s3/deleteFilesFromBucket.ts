import { env } from '@typebot.io/env'
import { Client } from 'minio'

export const deleteFilesFromBucket = async ({
  urls,
}: {
  urls: string[]
}): Promise<void> => {
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

  const bucket = env.S3_BUCKET

  const keys = urls.reduce<string[]>(
    (keys, url) => [
      ...keys,
      ...addKeyIfIncludesPublicCustomDomain(url),
      ...addKeyIfIncludesDefaultEndpoint(url, bucket),
    ],
    []
  )

  return minioClient.removeObjects(bucket, keys)
}

const addKeyIfIncludesPublicCustomDomain = (url: string) =>
  env.S3_PUBLIC_CUSTOM_DOMAIN && url.includes(env.S3_PUBLIC_CUSTOM_DOMAIN)
    ? [url.split(env.S3_PUBLIC_CUSTOM_DOMAIN + '/')[1]]
    : []

const addKeyIfIncludesDefaultEndpoint = (url: string, bucket: string) =>
  url.includes(env.S3_ENDPOINT as string) ? [url.split(`/${bucket}/`)[1]] : []

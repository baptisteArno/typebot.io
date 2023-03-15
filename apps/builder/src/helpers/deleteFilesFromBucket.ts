import { Client } from 'minio'

export const deleteFilesFromBucket = async ({
  urls,
}: {
  urls: string[]
}): Promise<void> => {
  if (
    !process.env.S3_ENDPOINT ||
    !process.env.S3_ACCESS_KEY ||
    !process.env.S3_SECRET_KEY
  )
    throw new Error(
      'S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY'
    )

  const useSSL =
    process.env.S3_SSL && process.env.S3_SSL === 'false' ? false : true
  const minioClient = new Client({
    endPoint: process.env.S3_ENDPOINT,
    port: process.env.S3_PORT ? parseInt(process.env.S3_PORT) : undefined,
    useSSL,
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION,
  })

  const bucket = process.env.S3_BUCKET ?? 'typebot'

  return minioClient.removeObjects(
    bucket,
    urls
      .filter((url) => url.includes(process.env.S3_ENDPOINT as string))
      .map((url) => url.split(`/${bucket}/`)[1])
  )
}

import { AWSError, config, Endpoint, S3 } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'

export const deleteFiles = async ({
  urls,
}: {
  urls: string[]
}): Promise<PromiseResult<S3.DeleteObjectsOutput, AWSError>> => {
  if (
    !process.env.S3_ENDPOINT ||
    !process.env.S3_ACCESS_KEY ||
    !process.env.S3_SECRET_KEY
  )
    throw new Error(
      'S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY'
    )

  const sslEnabled =
    process.env.S3_SSL && process.env.S3_SSL === 'false' ? false : true
  config.update({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION,
    sslEnabled,
  })
  const protocol = sslEnabled ? 'https' : 'http'
  const s3 = new S3({
    endpoint: new Endpoint(
      `${protocol}://${process.env.S3_ENDPOINT}${
        process.env.S3_PORT ? `:${process.env.S3_PORT}` : ''
      }`
    ),
  })

  const Bucket = process.env.S3_BUCKET ?? 'typebot'
  return s3
    .deleteObjects({
      Bucket,
      Delete: {
        Objects: urls.map((url) => ({ Key: url.split(`/${Bucket}/`)[1] })),
      },
    })
    .promise()
}

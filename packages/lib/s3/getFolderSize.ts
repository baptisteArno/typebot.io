import { env } from '@typebot.io/env'
import { Client } from 'minio'

type Props = {
  folderPath: string
}

export const getFolderSize = async ({ folderPath }: Props) => {
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

  return new Promise<number>((resolve, reject) => {
    let totalSize = 0

    const stream = minioClient.listObjectsV2(
      env.S3_BUCKET,
      'public/' + folderPath,
      true
    )

    stream.on('data', function (obj) {
      totalSize += obj.size
    })
    stream.on('error', function (err) {
      reject(err)
    })
    stream.on('end', function () {
      resolve(totalSize)
    })
  })
}

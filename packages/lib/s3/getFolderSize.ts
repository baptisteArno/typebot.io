import { env } from '@typebot.io/env'
import { initClient } from './initClient'

type Props = {
  folderPath: string
}

export const getFolderSize = async ({ folderPath }: Props) => {
  const minioClient = initClient()

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

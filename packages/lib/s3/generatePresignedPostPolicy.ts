import { env } from '@typebot.io/env'
import { PostPolicyResult } from 'minio'
import { initClient } from './initClient'

type Props = {
  filePath: string
  fileType?: string
  maxFileSize?: number
}

const tenMinutes = 10 * 60

export const generatePresignedPostPolicy = async ({
  filePath,
  fileType,
  maxFileSize,
}: Props): Promise<PostPolicyResult> => {
  const minioClient = initClient()

  const postPolicy = minioClient.newPostPolicy()
  if (maxFileSize)
    postPolicy.setContentLengthRange(0, maxFileSize * 1024 * 1024)
  postPolicy.setKey(filePath)
  postPolicy.setBucket(env.S3_BUCKET)
  postPolicy.setExpires(new Date(Date.now() + tenMinutes * 1000))
  postPolicy.formData['Cache-Control'] = 'public, max-age=86400'
  postPolicy.policy.conditions.push([
    'eq',
    '$Cache-Control',
    'public, max-age=86400',
  ])
  if (fileType) postPolicy.setContentType(fileType)

  return minioClient.presignedPostPolicy(postPolicy)
}

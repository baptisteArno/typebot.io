import got from 'got'
import { TRPCError } from '@trpc/server'
import { uploadFileToBucket } from '@typebot.io/lib/s3/uploadFileToBucket'

type Props = {
  mediaId: string
  systemUserToken: string
  downloadPath: string
}

export const downloadMedia = async ({
  mediaId,
  systemUserToken,
  downloadPath,
}: Props) => {
  const { body } = await got.get({
    url: `https://graph.facebook.com/v17.0/${mediaId}`,
    headers: {
      Authorization: `Bearer ${systemUserToken}`,
    },
  })
  const parsedBody = JSON.parse(body) as { url: string; mime_type: string }
  if (!parsedBody.url)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Request to Facebook failed. Could not find media url.',
      cause: body,
    })
  const streamBuffer = await got(parsedBody.url, {
    headers: {
      Authorization: `Bearer ${systemUserToken}`,
    },
  }).buffer()
  const typebotUrl = await uploadFileToBucket({
    fileName: `public/${downloadPath}/${mediaId}`,
    file: streamBuffer,
    mimeType: parsedBody.mime_type,
  })
  await got.delete({
    url: `https://graph.facebook.com/v17.0/${mediaId}`,
    headers: {
      Authorization: `Bearer ${systemUserToken}`,
    },
  })
  return typebotUrl
}

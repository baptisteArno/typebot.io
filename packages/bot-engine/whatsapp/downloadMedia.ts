import { env } from '@typebot.io/env'
import ky from 'ky'

type Props = {
  mediaId: string
  systemUserAccessToken: string
}

export const downloadMedia = async ({
  mediaId,
  systemUserAccessToken,
}: Props): Promise<{ file: Buffer; mimeType: string }> => {
  const { url, mime_type } = await ky
    .get(`${env.WHATSAPP_CLOUD_API_URL}/v17.0/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${systemUserAccessToken}`,
      },
    })
    .json<{ url: string; mime_type: string }>()

  return {
    file: Buffer.from(
      await ky
        .get(url, {
          headers: {
            Authorization: `Bearer ${systemUserAccessToken}`,
          },
        })
        .arrayBuffer()
    ),
    mimeType: mime_type,
  }
}

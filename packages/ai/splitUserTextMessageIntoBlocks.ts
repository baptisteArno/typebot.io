import { ImagePart, TextPart, UserContent } from 'ai'
import ky, { HTTPError } from 'ky'

type Props = {
  input: string
  shouldDownloadImages: boolean
}
export const splitUserTextMessageIntoBlocks = async ({
  input,
  shouldDownloadImages,
}: Props): Promise<UserContent> => {
  const urlRegex = /(^|\n\n)(https?:\/\/.+)(\n\n|$)/g
  const match = input.match(urlRegex)
  if (!match) return input
  let parts: (TextPart | ImagePart)[] = []
  let processedInput = input

  for (const url of match) {
    const textBeforeUrl = processedInput.slice(0, processedInput.indexOf(url))
    if (textBeforeUrl.trim().length > 0) {
      parts.push({ type: 'text', text: textBeforeUrl })
    }
    const cleanUrl = url.trim()

    try {
      const response = await ky.get(cleanUrl)
      if (
        !response.ok ||
        !response.headers.get('content-type')?.startsWith('image/')
      ) {
        parts.push({ type: 'text', text: cleanUrl })
      } else {
        parts.push({
          type: 'image',
          image: shouldDownloadImages
            ? await response.arrayBuffer()
            : url.trim(),
        })
      }
    } catch (err) {
      if (err instanceof HTTPError) {
        console.log(err.response.status, await err.response.text())
      } else {
        console.error(err)
      }
    }
    processedInput = processedInput.slice(
      processedInput.indexOf(url) + url.length
    )
  }

  if (processedInput.trim().length > 0) {
    parts.push({ type: 'text', text: processedInput })
  }

  return parts
}

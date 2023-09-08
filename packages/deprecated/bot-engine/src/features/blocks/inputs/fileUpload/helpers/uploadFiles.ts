import { sendRequest } from '@typebot.io/lib/utils'

type UploadFileProps = {
  basePath?: string
  files: {
    file: File
    path: string
  }[]
  onUploadProgress?: (percent: number) => void
}

type UrlList = (string | null)[]

export const uploadFiles = async ({
  basePath = '/api',
  files,
  onUploadProgress,
}: UploadFileProps): Promise<UrlList> => {
  const urls = []
  let i = 0
  for (const { file, path } of files) {
    onUploadProgress && onUploadProgress((i / files.length) * 100)
    i += 1
    const { data } = await sendRequest<{
      presignedUrl: string
      hasReachedStorageLimit: boolean
    }>(
      `${basePath}/storage/upload-url?filePath=${encodeURIComponent(
        path
      )}&fileType=${file.type}`
    )

    if (!data?.presignedUrl) continue

    const url = data.presignedUrl
    if (data.hasReachedStorageLimit) urls.push(null)
    else {
      const upload = await fetch(url, {
        method: 'PUT',
        body: file,
      })

      if (!upload.ok) continue

      urls.push(url.split('?')[0])
    }
  }
  return urls
}

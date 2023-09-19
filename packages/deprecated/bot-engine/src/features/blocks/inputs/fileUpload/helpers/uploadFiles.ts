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
      formData: Record<string, string>
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
      const formData = new FormData()
      Object.entries(data.formData).forEach(([key, value]) => {
        formData.append(key, value)
      })
      formData.append('file', file)
      const upload = await fetch(data.presignedUrl, {
        method: 'POST',
        body: formData,
      })

      if (!upload.ok) continue

      urls.push(url.split('?')[0])
    }
  }
  return urls
}

import { sendRequest } from '@typebot.io/lib/utils'

type UploadFileProps = {
  apiHost: string
  files: {
    file: File
    input: {
      sessionId: string
      fileName: string
    }
  }[]
  onUploadProgress?: (props: { fileIndex: number; progress: number }) => void
}

type UrlList = ({
  url: string
  type: string
} | null)[]

export const uploadFiles = async ({
  apiHost,
  files,
  onUploadProgress,
}: UploadFileProps): Promise<UrlList> => {
  const urls: UrlList = []
  let i = 0
  for (const { input, file } of files) {
    onUploadProgress &&
      onUploadProgress({ progress: (i / files.length) * 100, fileIndex: i })
    i += 1
    const { data } = await sendRequest<{
      presignedUrl: string
      formData: Record<string, string>
      fileUrl: string
    }>({
      method: 'POST',
      url: `${apiHost}/api/v2/generate-upload-url`,
      body: {
        fileName: input.fileName,
        sessionId: input.sessionId,
        fileType: file.type,
      },
    })

    if (!data?.presignedUrl) continue
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

      urls.push({ url: data.fileUrl, type: file.type })
    }
  }
  return urls
}

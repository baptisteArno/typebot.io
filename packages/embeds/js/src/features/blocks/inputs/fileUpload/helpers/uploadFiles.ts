import { sendRequest } from '@typebot.io/lib/utils'

type UploadFileProps = {
  apiHost: string
  files: {
    file: File
    input: {
      typebotId: string
      blockId: string
      resultId: string
      fileName: string
    }
  }[]
  onUploadProgress?: (percent: number) => void
}

type UrlList = (string | null)[]

export const uploadFiles = async ({
  apiHost,
  files,
  onUploadProgress,
}: UploadFileProps): Promise<UrlList> => {
  const urls = []
  let i = 0
  for (const { input, file } of files) {
    onUploadProgress && onUploadProgress((i / files.length) * 100)
    i += 1
    const { data } = await sendRequest<{
      presignedUrl: string
      fileUrl: string
    }>({
      method: 'POST',
      url: `${apiHost}/api/v1/generate-upload-url`,
      body: {
        filePathProps: input,
        fileType: file.type,
      },
    })

    if (!data?.presignedUrl) continue
    else {
      const upload = await fetch(data.presignedUrl, {
        method: 'PUT',
        body: file,
      })

      if (!upload.ok) continue

      urls.push(data.fileUrl)
    }
  }
  return urls
}

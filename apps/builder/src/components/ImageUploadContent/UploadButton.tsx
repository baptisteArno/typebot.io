import { compressFile } from '@/utils/helpers'
import { Button, ButtonProps, chakra } from '@chakra-ui/react'
import { ChangeEvent, useState } from 'react'
import { uploadFiles } from 'utils'

type UploadButtonProps = {
  fileType: 'image' | 'audio'
  filePath: string
  includeFileName?: boolean
  onFileUploaded: (url: string) => void
} & ButtonProps

export const UploadButton = ({
  fileType,
  filePath,
  includeFileName,
  onFileUploaded,
  ...props
}: UploadButtonProps) => {
  const [isUploading, setIsUploading] = useState(false)

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files) return
    setIsUploading(true)
    const file = e.target.files[0]
    const urls = await uploadFiles({
      files: [
        {
          file: await compressFile(file),
          path: `public/${filePath}${includeFileName ? `/${file.name}` : ''}`,
        },
      ],
    })
    if (urls.length && urls[0]) onFileUploaded(urls[0] + '?v=' + Date.now())
    setIsUploading(false)
  }

  return (
    <>
      <chakra.input
        data-testid="file-upload-input"
        type="file"
        id="file-input"
        display="none"
        onChange={handleInputChange}
        accept={fileType === 'image' ? '.jpg, .jpeg, .png, .gif' : '.mp3, .wav'}
      />
      <Button
        as="label"
        size="sm"
        htmlFor="file-input"
        cursor="pointer"
        isLoading={isUploading}
        {...props}
      >
        {props.children}
      </Button>
    </>
  )
}

import { useToast } from '@/hooks/useToast'
import { Button, ButtonProps, chakra } from '@chakra-ui/react'
import { ChangeEvent, useId, useState } from 'react'
import { FilePathUploadProps } from '@/features/upload/api/generateUploadUrl'
import { trpc } from '@/lib/trpc'
import { compressFile } from '@/helpers/compressFile'

type UploadButtonProps = {
  fileType: 'image' | 'audio' | 'video' | 'document'
  filePathProps: FilePathUploadProps
  onFileUploaded: (url: string, fileName: string) => void
  acceptedFileTypes?: string[]
  maxSizeInMB?: number
} & ButtonProps

export const UploadButton = ({
  fileType,
  filePathProps,
  onFileUploaded,
  acceptedFileTypes,
  maxSizeInMB,
  ...props
}: UploadButtonProps) => {
  const inputId = useId()
  const [isUploading, setIsUploading] = useState(false)
  const { showToast } = useToast()
  const { mutateAsync } = trpc.generateUploadUrl.useMutation()

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] as File | undefined
    e.target.value = ''
    if (!file)
      return showToast({ description: 'Could not read file.', status: 'error' })
    if (acceptedFileTypes && !acceptedFileTypes.includes(file.type)) {
      return showToast({
        description: `File type not supported. Accepted: ${acceptedFileTypes
          .map((type) => type.replace(/^[a-z]+\//, '').toUpperCase())
          .join(', ')}.`,
        status: 'error',
      })
    }
    if (maxSizeInMB && file.size > maxSizeInMB * 1024 * 1024) {
      return showToast({
        description: `File is too big. Maximum size is ${maxSizeInMB} MB.`,
        status: 'error',
      })
    }

    setIsUploading(true)
    try {
      const compressedFile = await compressFile(file)
      const data = await mutateAsync({
        filePathProps,
        fileType: compressedFile.type,
        maxFileSize: maxSizeInMB,
      })
      const formData = new FormData()
      Object.entries(data.formData).forEach(([key, value]) => {
        formData.append(key, value)
      })
      formData.append('file', compressedFile)
      const upload = await fetch(data.presignedUrl, {
        method: 'POST',
        body: formData,
      })

      if (!upload.ok) {
        showToast({
          description: 'Error while trying to upload the file.',
          status: 'error',
        })
        return
      }

      onFileUploaded(data.fileUrl + '?v=' + Date.now(), file.name)
    } catch (error) {
      showToast({
        description:
          (error instanceof Error && error.message) ||
          'Error while trying to upload the file.',
        status: 'error',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <chakra.input
        data-testid="file-upload-input"
        type="file"
        id={inputId}
        display="none"
        onChange={handleInputChange}
        accept={
          acceptedFileTypes?.join(',') ??
          {
            image: 'image/*',
            audio: 'audio/*',
            video: 'video/*',
            document: undefined,
          }[fileType]
        }
      />
      <Button
        as="label"
        size="sm"
        htmlFor={inputId}
        cursor="pointer"
        isLoading={isUploading}
        {...props}
      >
        {props.children}
      </Button>
    </>
  )
}

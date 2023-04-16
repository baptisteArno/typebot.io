import { Button, ButtonProps, chakra } from '@chakra-ui/react'
import React, { ChangeEvent, useState } from 'react'
import { compressFile, uploadFile } from 'services/utils'

type UploadButtonProps = {
  filePath: string
  includeFileName?: boolean
  onFileUploaded: (url: string) => void
} & ButtonProps

export const UploadButton = ({
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
    console.log(file)
    const { url } = await uploadFile(
      await compressFile(file),
      filePath + (includeFileName ? `/${file.name}` : '')
    )
    if (url) onFileUploaded(url)
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
        accept=".jpg, .jpeg, .png, image/*, audio/*, video/*, .xlsx, .xls, image/*, .doc, .docx, .ppt, .pptx, .txt, .pdf"
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

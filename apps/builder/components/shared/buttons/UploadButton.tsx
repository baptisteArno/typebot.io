import { Button, ButtonProps, chakra } from '@chakra-ui/react'
import React, { ChangeEvent } from 'react'

type UploadButtonProps = { onUploadChange: (file: File) => void } & ButtonProps

export const UploadButton = ({
  onUploadChange,
  ...props
}: UploadButtonProps) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files) return
    onUploadChange(e.target.files[0])
  }
  return (
    <>
      <chakra.input
        type="file"
        id="file-input"
        display="none"
        onChange={handleInputChange}
        accept=".jpg, .jpeg, .png"
      />
      <Button
        as="label"
        size="sm"
        htmlFor="file-input"
        cursor="pointer"
        {...props}
      >
        {props.children}
      </Button>
    </>
  )
}

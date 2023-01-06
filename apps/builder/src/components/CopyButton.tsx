import React, { useEffect } from 'react'
import { ButtonProps, Button, useClipboard } from '@chakra-ui/react'

interface CopyButtonProps extends ButtonProps {
  textToCopy: string
  onCopied?: () => void
}

export const CopyButton = (props: CopyButtonProps) => {
  const { textToCopy, onCopied, ...buttonProps } = props
  const { hasCopied, onCopy, setValue } = useClipboard(textToCopy)

  useEffect(() => {
    setValue(textToCopy)
  }, [setValue, textToCopy])

  return (
    <Button
      isDisabled={hasCopied}
      onClick={() => {
        onCopy()
        if (onCopied) onCopied()
      }}
      {...buttonProps}
    >
      {!hasCopied ? 'Copy' : 'Copied'}
    </Button>
  )
}

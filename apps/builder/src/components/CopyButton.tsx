import React from 'react'
import { ButtonProps, Button, useClipboard } from '@chakra-ui/react'

interface CopyButtonProps extends ButtonProps {
  textToCopy: string
  onCopied?: () => void
}

export const CopyButton = (props: CopyButtonProps) => {
  const { textToCopy, onCopied, ...buttonProps } = props
  const { hasCopied, onCopy } = useClipboard(textToCopy)

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

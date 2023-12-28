import React, { useEffect } from 'react'
import { ButtonProps, Button, useClipboard } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'

interface CopyButtonProps extends ButtonProps {
  textToCopy: string
  onCopied?: () => void
  text?: {
    copy: string
    copied: string
  }
}

export const CopyButton = (props: CopyButtonProps) => {
  const { textToCopy, onCopied, ...buttonProps } = props
  const { hasCopied, onCopy, setValue } = useClipboard(textToCopy)
  const { t } = useTranslate()

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
      {!hasCopied
        ? props.text?.copy ?? t('copy')
        : props.text?.copied ?? t('copied')}
    </Button>
  )
}

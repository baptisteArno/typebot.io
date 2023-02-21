import { CodeEditor } from '@/components/CodeEditor'
import React from 'react'

type Props = {
  customCss?: string
  onCustomCssChange: (css: string) => void
}

export const CustomCssSettings = ({ customCss, onCustomCssChange }: Props) => {
  return (
    <CodeEditor
      defaultValue={customCss ?? ''}
      lang="css"
      onChange={onCustomCssChange}
    />
  )
}

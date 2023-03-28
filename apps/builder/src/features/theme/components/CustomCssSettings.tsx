import { CodeEditor } from '@/components/inputs/CodeEditor'
import React from 'react'

type Props = {
  customCss?: string
  onCustomCssChange: (css: string) => void
}

export const CustomCssSettings = ({ customCss, onCustomCssChange }: Props) => {
  return (
    <CodeEditor
      value={customCss ?? ''}
      lang="css"
      onChange={onCustomCssChange}
    />
  )
}

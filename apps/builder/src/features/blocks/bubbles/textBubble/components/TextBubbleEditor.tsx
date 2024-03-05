import React, { useState } from 'react'
import { Plate } from '@udecode/plate-core'
import { platePlugins } from '@/lib/plate'
import { TElement } from '@udecode/plate-common'
import { TextEditorEditorContent } from './TextEditorEditorContent'

type TextBubbleEditorContentProps = {
  id: string
  initialValue: TElement[]
  onClose: (newContent: TElement[]) => void
}

export const TextBubbleEditor = ({
  id,
  initialValue,
  onClose,
}: TextBubbleEditorContentProps) => {
  const [textEditorValue, setTextEditorValue] =
    useState<TElement[]>(initialValue)

  const closeEditor = () => onClose(textEditorValue)

  return (
    <Plate
      id={id}
      plugins={platePlugins}
      initialValue={
        initialValue.length === 0
          ? [{ type: 'p', children: [{ text: '' }] }]
          : initialValue
      }
      onChange={setTextEditorValue}
    >
      <TextEditorEditorContent closeEditor={closeEditor} />
    </Plate>
  )
}

import { Plate } from '@udecode/plate-core'
import { platePlugins } from '@/lib/plate'
import { TElement } from '@udecode/plate-common'
import { NoteEditorContent } from './NoteEditorContent'
import { useEffect, useRef } from 'react'

type Props = {
  id: string
  initialValue: TElement[]
  onChange: (value: TElement[]) => void
  onClose: () => void
}

export const NoteEditor = ({ id, initialValue, onChange, onClose }: Props) => {
  const editorValueRef = useRef<TElement[]>(initialValue)

  const setEditorValue = (newValue: TElement[]) => {
    editorValueRef.current = newValue
  }

  // Save on unmount to mimic TextBubble behavior and batch updates
  useEffect(
    () => () => {
      onChange(editorValueRef.current)
    },
    [onChange]
  )

  return (
    <Plate
      id={id}
      plugins={platePlugins}
      initialValue={
        initialValue.length === 0
          ? [{ type: 'p', children: [{ text: '' }] }]
          : initialValue
      }
      onChange={setEditorValue}
    >
      <NoteEditorContent closeEditor={onClose} />
    </Plate>
  )
}

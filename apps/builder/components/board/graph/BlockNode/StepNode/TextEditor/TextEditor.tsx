import { Stack, useOutsideClick } from '@chakra-ui/react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Plate,
  selectEditor,
  serializeHtml,
  TDescendant,
  withPlate,
} from '@udecode/plate-core'
import { editorStyle, platePlugins } from 'libs/plate'
import { useDebounce } from 'use-debounce'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { createEditor } from 'slate'
import { ToolBar } from './ToolBar'
import { parseHtmlStringToPlainText } from 'services/utils'
import { TextStep } from 'models'

type TextEditorProps = {
  stepId: string
  initialValue: TDescendant[]
  onClose: () => void
}

export const TextEditor = ({
  initialValue,
  stepId,
  onClose,
}: TextEditorProps) => {
  const editor = useMemo(
    () => withPlate(createEditor(), { id: stepId, plugins: platePlugins }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const { updateStep } = useTypebot()
  const [value, setValue] = useState(initialValue)
  const [debouncedValue] = useDebounce(value, 500)
  const textEditorRef = useRef<HTMLDivElement>(null)
  useOutsideClick({
    ref: textEditorRef,
    handler: () => {
      save(value)
      onClose()
    },
  })

  useEffect(() => {
    save(debouncedValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

  const save = (value: unknown[]) => {
    if (value.length === 0) return
    const html = serializeHtml(editor, {
      nodes: value,
    })
    updateStep(stepId, {
      content: {
        html,
        richText: value,
        plainText: parseHtmlStringToPlainText(html),
      },
    } as TextStep)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
  }
  return (
    <Stack
      flex="1"
      ref={textEditorRef}
      borderWidth="2px"
      borderColor="blue.500"
      rounded="md"
      onMouseDown={handleMouseDown}
      spacing={0}
    >
      <ToolBar />
      <Plate
        id={stepId}
        editableProps={{
          style: editorStyle,
          autoFocus: true,
          onFocus: () => {
            if (editor.children.length === 0) return
            selectEditor(editor, {
              edge: 'end',
            })
          },
          'aria-label': 'Text editor',
        }}
        initialValue={
          initialValue.length === 0
            ? [{ type: 'p', children: [{ text: '' }] }]
            : initialValue
        }
        onChange={setValue}
        editor={editor}
      />
    </Stack>
  )
}

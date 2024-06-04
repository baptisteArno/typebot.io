import React, { useMemo, useRef, useState } from 'react'
import { Flex, Stack, useOutsideClick } from '@chakra-ui/react'
import {
  Plate,
  PlateEditor,
  selectEditor,
  serializeHtml,
  TEditor,
  TElement,
  Value,
  withPlate,
} from '@udecode/plate-core'
import { editorStyle, platePlugins } from 'libs/plate'
import {
  BaseEditor,
  BaseSelection,
  createEditor,
  Node,
  Path,
  Transforms,
} from 'slate'
import { ReactEditor } from 'slate-react'
import { defaultTextBubbleContent, TextBubbleContent, Variable } from 'models'
import { parseHtmlStringToPlainText } from 'services/utils'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { ToolBar } from './ToolBar'

type TextBubbleEditorProps = {
  initialValue: TElement[]
  onClose: (newContent: TextBubbleContent) => void
  onKeyUp?: (newContent: TextBubbleContent) => void
  increment?: number
  maxLength?: number
  required?: boolean | { errorMsg?: string }
  menuPosition?: 'absolute' | 'fixed'
}

export const TextBubbleEditor = ({
  initialValue,
  onClose,
  onKeyUp,
  increment,
  maxLength,
  required,
  menuPosition = 'fixed',
}: TextBubbleEditorProps) => {
  const [value, setValue] = useState(initialValue)
  const [focus, setFocus] = useState(false)

  const [isVariableDropdownOpen, setIsVariableDropdownOpen] = useState(false)
  const varDropdownRef = useRef<HTMLDivElement | null>(null)
  const rememberedSelection = useRef<BaseSelection | null>(null)
  const textEditorRef = useRef<HTMLDivElement>(null)

  const randomEditorId = useMemo(
    () => `${Math.random().toString()}${increment ? `-${increment}` : ''}`,
    [increment]
  )

  const editor = useMemo(
    () =>
      withPlate(createEditor() as TEditor<Value>, {
        id: randomEditorId,
        plugins: platePlugins,
      }) as PlateEditor,
    [randomEditorId]
  )
  const withMaxLength = (editor: PlateEditor) => {
    editor.normalizeNode = (entry: [Node, Path]) => {
      const [node, path] = entry
      const nodeText = Node.string(node)
      const currentLength = nodeText.length
      if (maxLength && currentLength > maxLength) {
        const lengthUntilBeforeTheLastNode = editor.children.reduce(
          (acc, curr, i) => {
            if (i === editor.children.length - 1) return acc
            return acc + Node.string(curr).length
          },
          0
        )
        const lastNode = editor.children[editor.children.length - 1]

        const newNodes = [
          {
            type: 'p',
            children: [
              {
                text: Node.string(lastNode).slice(
                  0,
                  maxLength - lengthUntilBeforeTheLastNode
                ),
              },
            ],
          },
        ]
        Transforms.removeNodes(editor as BaseEditor, {
          match: (n) => n === lastNode,
        })
        Transforms.insertNodes(editor as BaseEditor, newNodes)

        return
      }
    }

    return editor
  }
  const closeEditor = () => {
    if (onClose) onClose(convertValueToStepContent(value))
  }

  const keyUpEditor = (v?: TElement[]) => {
    if (onKeyUp) {
      onKeyUp(convertValueToStepContent(v || value))
    }
  }

  useOutsideClick({
    ref: textEditorRef,
    handler: closeEditor,
  })

  const convertValueToStepContent = (v: TElement[]): TextBubbleContent => {
    if (v.length === 0) defaultTextBubbleContent
    const html = serializeHtml(editor, {
      nodes: v,
    }).replace(/<[^/>]*>\s*<\/[^>]*>/g, '')

    return {
      html,
      richText: v,
      plainText: parseHtmlStringToPlainText(html),
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleEmoji = (emoji?: string) => {
    if (!rememberedSelection.current || !emoji) return
    Transforms.select(editor as BaseEditor, rememberedSelection.current)
    Transforms.insertText(editor as BaseEditor, emoji)
    ReactEditor.focus(editor as unknown as ReactEditor)
  }

  const handleVariableSelected = (variable?: Variable) => {
    setIsVariableDropdownOpen(false)
    if (!rememberedSelection.current || !variable) return
    Transforms.select(editor as BaseEditor, rememberedSelection.current)
    Transforms.insertText(editor as BaseEditor, '{{' + variable.token + '}}')
    ReactEditor.focus(editor as unknown as ReactEditor)
  }

  const handleChangeEditorContent = (val: TElement[]) => {
    const plainText = val.map((node) => Node.string(node)).join(' ')

    if (maxLength && plainText.length > maxLength) {
      const truncatedText = plainText.slice(0, maxLength)

      const newValue = [{ type: 'p', children: [{ text: truncatedText }] }]
      setValue(newValue)
      return
    }

    const timeout = setTimeout(() => {
      if (timeout) clearTimeout(timeout)
      setValue(val)
      keyUpEditor(val)
    }, 250)

    setIsVariableDropdownOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.shiftKey) return
    if (e.key === 'Enter') closeEditor()
  }

  const checkRequiredField = () => {
    return (
      required &&
      value.length <= 1 &&
      value[0]?.children.every((c) => {
        return c?.text?.trim().length < 1
      })
    )
  }

  const chooseBorderColor = () => {
    if (checkRequiredField()) {
      return 'red.400'
    }
    if (focus) return 'blue.400'

    return 'grey.400'
  }
  return (
    <>
      <Stack
        flex="1"
        borderColor={chooseBorderColor()}
        ref={textEditorRef}
        borderWidth="2px"
        rounded="md"
        onMouseDown={handleMouseDown}
        pos="relative"
        spacing={0}
        cursor="text"
        onFocus={() => {
          setFocus(true)
        }}
        onBlur={() => {
          setFocus(false)
        }}
      >
        <ToolBar
          editor={editor}
          onVariablesButtonClick={(showDialog) => {
            setIsVariableDropdownOpen(showDialog)
          }}
          onEmojiSelected={handleEmoji}
        />
        <Plate
          id={randomEditorId}
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
            onBlur: () => {
              rememberedSelection.current = editor.selection
            },
            onKeyDown: handleKeyDown,
            onKeyUp: () => keyUpEditor(),
          }}
          initialValue={
            initialValue.length === 0
              ? [{ type: 'p', children: [{ text: '' }] }]
              : initialValue
          }
          onChange={handleChangeEditorContent}
          editor={withMaxLength(editor)}
        />
        {isVariableDropdownOpen && (
          <Flex
            pos="absolute"
            ref={varDropdownRef}
            shadow="lg"
            rounded="md"
            bgColor="white"
            w="100%"
            zIndex={10}
          >
            <VariableSearchInput
              onSelectVariable={handleVariableSelected}
              placeholder="Pesquise sua variável"
              handleOutsideClick={() => setIsVariableDropdownOpen(false)}
              isSaveContext={false}
              labelDefault={'Selecione uma variável:'}
              menuPosition={menuPosition}
            />
          </Flex>
        )}
      </Stack>
      {checkRequiredField() && (
        <Flex color="red.400" fontSize="sm" mt={2}>
          {typeof required === 'object'
            ? required?.errorMsg
            : 'Este campo é obrigatório'}
        </Flex>
      )}
    </>
  )
}

import {
  BoxProps,
  Fade,
  HStack,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { VariablesButton } from '@/features/variables/components/VariablesButton'
import { Variable } from '@typebot.io/schemas'
import { env } from '@typebot.io/lib'
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night'
import { githubLight } from '@uiw/codemirror-theme-github'
import { LanguageName, loadLanguage } from '@uiw/codemirror-extensions-langs'
import { isDefined } from '@udecode/plate-common'
import { CopyButton } from '../CopyButton'

type Props = {
  value?: string
  defaultValue?: string
  lang: LanguageName
  isReadOnly?: boolean
  debounceTimeout?: number
  withVariableButton?: boolean
  height?: string
  onChange?: (value: string) => void
}
export const CodeEditor = ({
  defaultValue,
  lang,
  onChange,
  height = '250px',
  withVariableButton = true,
  isReadOnly = false,
  debounceTimeout = 1000,
  ...props
}: Props & Omit<BoxProps, 'onChange'>) => {
  const theme = useColorModeValue(githubLight, tokyoNight)
  const codeEditor = useRef<ReactCodeMirrorRef | null>(null)
  const [carretPosition, setCarretPosition] = useState<number>(0)
  const isVariableButtonDisplayed = withVariableButton && !isReadOnly
  const [value, _setValue] = useState(defaultValue ?? '')
  const { onOpen, onClose, isOpen } = useDisclosure()

  const setValue = useDebouncedCallback(
    (value) => {
      _setValue(value)
      onChange && onChange(value)
    },
    env('E2E_TEST') === 'true' ? 0 : debounceTimeout
  )

  const handleVariableSelected = (variable?: Pick<Variable, 'id' | 'name'>) => {
    codeEditor.current?.view?.focus()
    const insert = `{{${variable?.name}}}`
    codeEditor.current?.view?.dispatch({
      changes: {
        from: carretPosition,
        insert,
      },
      selection: { anchor: carretPosition + insert.length },
    })
  }

  const handleChange = (newValue: string) => {
    setValue(newValue)
  }

  const rememberCarretPosition = () => {
    setCarretPosition(
      codeEditor.current?.view?.state?.selection.asSingle().main.head ?? 0
    )
  }

  useEffect(
    () => () => {
      setValue.flush()
    },
    [setValue]
  )

  return (
    <HStack
      align="flex-end"
      spacing={0}
      borderWidth={'1px'}
      rounded="md"
      bg={useColorModeValue('white', '#1A1B26')}
      width="full"
      h="full"
      pos="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      sx={{
        '& .cm-editor': {
          maxH: '70vh',
          outline: '0px solid transparent !important',
          rounded: 'md',
        },
        '& .cm-scroller': {
          rounded: 'md',
          overflow: 'auto',
        },
        '& .cm-gutter,.cm-content': {
          minH: isReadOnly ? '0' : height,
        },
        '& .ͼ1 .cm-scroller': {
          fontSize: '14px',
          fontFamily:
            'JetBrainsMono, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
        },
      }}
    >
      <CodeMirror
        data-testid="code-editor"
        ref={codeEditor}
        value={props.value ?? value}
        onChange={handleChange}
        onBlur={rememberCarretPosition}
        theme={theme}
        extensions={[loadLanguage(lang)].filter(isDefined)}
        editable={!isReadOnly}
        style={{
          width: isVariableButtonDisplayed ? 'calc(100% - 32px)' : '100%',
        }}
        spellCheck={false}
      />
      {isVariableButtonDisplayed && (
        <VariablesButton onSelectVariable={handleVariableSelected} size="sm" />
      )}
      {isReadOnly && (
        <Fade in={isOpen}>
          <CopyButton
            textToCopy={props.value ?? value}
            pos="absolute"
            right={0.5}
            top={0.5}
            size="xs"
            colorScheme="blue"
          />
        </Fade>
      )}
    </HStack>
  )
}

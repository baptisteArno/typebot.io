import {
  BoxProps,
  HStack,
  Stack,
  useColorModeValue,
  useDisclosure,
  IconButton,
  FormControl,
} from '@chakra-ui/react'
import { TrashIcon } from 'assets/icons'
import { useEffect, useRef, useState, useMemo } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { githubDark, githubLight } from '@uiw/codemirror-theme-github'
import { LanguageName, loadLanguage } from '@uiw/codemirror-extensions-langs'
import { isDefined } from '@udecode/plate-common'
import { linter } from '@codemirror/lint'
import { VariableSearchInput } from './VariableSearchInput/VariableSearchInput'
import { CreateButton } from './VariableSearchInput/VariableSearchInput.style'
import { Variable } from 'models'
import { isEmpty } from 'utils'

type Props = {
  value?: string
  defaultValue?: string
  lang: LanguageName
  isReadOnly?: boolean
  debounceTimeout?: number
  withVariableButton?: boolean
  height?: string
  maxHeight?: string
  minWidth?: string
  onChange?: (value: string) => void
  postVariableSelected?: (variable: Pick<Variable, 'id' | 'name' | 'token'>) => void
}
export const CodeEditor = ({
  defaultValue,
  lang,
  onChange,
  postVariableSelected,
  height = '250px',
  maxHeight = '70vh',
  minWidth,
  withVariableButton = true,
  isReadOnly = false,
  debounceTimeout = 1000,
  ...props
}: Props & Omit<BoxProps, 'onChange'>) => {
  const theme = useColorModeValue(githubLight, githubDark)
  const codeEditor = useRef<ReactCodeMirrorRef | null>(null)
  const [carretPosition, setCarretPosition] = useState<number>(0)
  const isVariableButtonDisplayed = withVariableButton && !isReadOnly
  const [value, _setValue] = useState(defaultValue ?? '{}')
  const { onOpen, onClose, isOpen } = useDisclosure()
  const [addVariable, setAddVariable] = useState<boolean>(false)

  const setValue = useDebouncedCallback(
    (value) => {
      _setValue(value)
      onChange && onChange(value)
    },
    isEmpty(process.env.NEXT_PUBLIC_E2E_TEST) ? debounceTimeout : 0
  )

  const handleChange = (newValue: string) => {
    setValue(newValue)
  }

  const handleVariableSelected = (
    variable?: Pick<Variable, 'id' | 'name' | 'token'>
  ) => {
    if (!variable) return
    codeEditor.current?.view?.focus()
    const insert = `${variable.token}`
    codeEditor.current?.view?.dispatch({
      changes: {
        from: carretPosition,
        insert,
      },
      selection: { anchor: carretPosition + insert.length },
    })

    if (postVariableSelected) postVariableSelected(variable)
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
  const handleButtonVariable = () => {
    setAddVariable(!addVariable)
  }

  return (
    <HStack
      align="flex-end"
      flexDirection={'column'}
      spacing={0}
      borderWidth={'0px'}
      rounded="md"
      bg={useColorModeValue('white', '#1A1B26')}
      width="full"
      h="full"
      pos="relative"
      minW={minWidth}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      maxWidth={props.maxWidth}
      sx={{
        '& .cm-editor': {
          maxH: maxHeight,
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
        theme={githubDark}
        extensions={[loadLanguage(lang)].filter(isDefined)}
        editable={!isReadOnly}
        style={{
          width: isVariableButtonDisplayed ? 'calc(100%)' : '100%',
        }}
        spellCheck={false}
      />
      {isVariableButtonDisplayed && (
        <HStack flexDirection={'column'} width="full">
          {addVariable && (
            <IconButton
              icon={<TrashIcon />}
              aria-label="Editor body"
              size="xs"
              onClick={handleButtonVariable}
              alignSelf={'flex-start'}
              width={'25px'}
              top={'15px'}
              right={'10px'}
            />
          )}
          {addVariable && (
            <Stack rounded="md" flex="1" minHeight="18vh">
              <FormControl>
                <VariableSearchInput
                  onSelectVariable={handleVariableSelected}
                  placeholder="Pesquise sua variável"
                  isCloseModal={false}
                  labelDefault='Adicionar variável ao body:'
                />
              </FormControl>
            </Stack>
          )}
          {!addVariable && (
            <CreateButton onClick={handleButtonVariable}>
              {'Adicionar variável'}
            </CreateButton>
          )}
        </HStack>
      )}
    </HStack>
  )
}

import React, {
  useState,
  useRef,
  useEffect,
  WheelEventHandler,
  useContext,
} from 'react'
import {
  useDisclosure,
  useOutsideClick,
  Flex,
  InputProps,
} from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import Select from 'react-select'
import { Variable } from 'models'
import { useDebouncedCallback } from 'use-debounce'
import { isEmpty } from 'utils'
import { Container } from './VariableSearchInput.style'
import { CustomFieldTitle } from 'enums/customFieldsTitlesEnum'
import { StepNodeContext } from '../Graph/Nodes/StepNode/StepNode/StepNode'
import { CreateChatFieldModal } from '../modals/CreateChatFieldModal/CreateChatFieldModal'

type Props = {
  initialVariableId?: string
  debounceTimeout?: number
  isDefaultOpen?: boolean
  addVariable?: boolean
  isCloseModal?: boolean
  labelDefault?: string
  isSaveContext?: boolean
  isApi?: boolean
  menuPosition?: 'absolute' | 'fixed'
  variablesSelectorIsOpen?: boolean
  handleOutsideClick?: () => void
  onSelectVariable: (
    variable: Pick<
      Variable,
      | 'id'
      | 'name'
      | 'domain'
      | 'type'
      | 'token'
      | 'variableId'
      | 'fieldId'
      | 'fixed'
      | 'example'
    >
  ) => void
} & InputProps

export const VariableSearchInput = ({
  initialVariableId,
  onSelectVariable,
  isDefaultOpen,
  handleOutsideClick,
  addVariable = true,
  isCloseModal = true,
  debounceTimeout = 1000,
  labelDefault = '',
  isSaveContext = true,
  isApi = false,
  variablesSelectorIsOpen = false,
  menuPosition = 'fixed',
  ...inputProps
}: Props) => {
  const { onOpen, onClose } = useDisclosure()
  const { typebot } = useTypebot()

  const variables = typebot?.variables ?? []
  const makeTitle = (propertiesType: string): string => {
    switch (propertiesType) {
      case 'PERSON':
        return CustomFieldTitle.PERSON
      case 'CHAT':
        return CustomFieldTitle.CHAT
      case 'ORGANIZATION':
        return CustomFieldTitle.ORGANIZATION
      default:
        return ''
    }
  }

  const dontSave = {
    id: '',
    key: 'no-variable',
    token: 'não salvar',
  }

  const newVariable = {
    id: 'new',
    key: 'new-variable',
    token: '+ criar variável',
    domain: 'CHAT',
  }

  const myVariable = (typebot?.variables.find((v) => {
    return (v.id && v.id === initialVariableId) || v.token === initialVariableId
  }) ||
    (isSaveContext && !isApi && dontSave)) as Variable

  const initial = {
    ACTIONS: {
      label: '',
      options: [],
    },
  } as any

  if (isSaveContext && !isApi) initial.ACTIONS.options.push(dontSave)

  if (addVariable) initial.ACTIONS.options.push(newVariable)

  const grouped = typebot?.variables.reduce((acc, current) => {
    if (!acc[current.domain]) {
      acc[current.domain] = {
        label: makeTitle(current.domain),
        options: [],
      }
    }

    acc[current.domain].options.push(current)

    return acc
  }, initial)

  const options: Variable[] = Object.values(grouped)

  const debounced = useDebouncedCallback(
    (value) => {
      const variable = variables.find((v) => v.name === value)
      if (variable) {
        onSelectVariable(variable)
      }
    },
    isEmpty(process.env.NEXT_PUBLIC_E2E_TEST) ? debounceTimeout : 0
  )

  const dropdownRef = useRef(null)
  const boxRef = useRef(null)

  const [screen, setScreen] = useState<'VIEWER' | 'CREATE' | 'REMOVE'>('VIEWER')

  useOutsideClick({
    ref: dropdownRef,
    handler: onClose,
  })

  useOutsideClick({
    ref: boxRef,
    handler: () => {
      if (screen !== 'CREATE' && handleOutsideClick) handleOutsideClick()
    },
  })

  useEffect(() => {
    if (isDefaultOpen) onOpen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(
    () => () => {
      debounced.flush()
    },
    [debounced]
  )
  const { setIsPopoverOpened } = useContext(StepNodeContext)

  const onInputChange = (event: any, actionData: any): void => {
    if (event) {
      if (event.key === 'no-variable') {
        onSelectVariable({} as any)
        return
      }

      if (event.key === 'new-variable') {
        handleToggleScreen()
        return
      }

      if (event.id || event.token) {
        if (event.token === '') {
          onSelectVariable({} as any)
          return
        }
        onSelectVariable(event)
        debounced(event.token)
        onClose()

        if (isCloseModal) {
          setIsPopoverOpened?.(false)
        }
      }
    }
  }

  const handleToggleScreen = (): void => {
    setScreen((e) => {
      if (e === 'VIEWER') {
        return 'CREATE'
      } else {
        return 'VIEWER'
      }
    })
  }

  const onCreateVariable = (variable: Variable): void => {
    onSelectVariable(variable)
    setScreen('VIEWER')
    onClose()
  }

  const handleContentWheel: WheelEventHandler = (event) => {
    event.stopPropagation()
  }

  return (
    <Flex
      ref={boxRef}
      w="full"
      border={'1px'}
      borderColor={'#e5e7eb'}
      borderStyle={'solid'}
      borderRadius={'6px'}
    >
      {screen === 'VIEWER' && (
        <Container data-screen={screen}>
          {labelDefault || 'Selecione uma variável para salvar a resposta:'}
          <div onWheelCapture={handleContentWheel}>
            <Select
              menuIsOpen={variablesSelectorIsOpen ? true : undefined}
              value={myVariable}
              noOptionsMessage={() => 'Variável não encontrada'}
              onChange={onInputChange}
              options={options}
              placeholder={inputProps.placeholder ?? 'Selecione a variável'}
              getOptionLabel={(option: Variable) => option.token}
              getOptionValue={(option: Variable) =>
                option.variableId ?? option.id
              }
              menuPlacement="auto"
              menuPosition={menuPosition}
            />
          </div>
        </Container>
      )}
      <CreateChatFieldModal
        isOpen={screen === 'CREATE'}
        onClose={() => {
          setScreen('VIEWER')
        }}
        onCreateVariable={onCreateVariable}
      />
    </Flex>
  )
}

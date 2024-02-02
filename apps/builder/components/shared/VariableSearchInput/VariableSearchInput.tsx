import React, {
  useState,
  useRef,
  ChangeEvent,
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
import cuid from 'cuid'
import Select from 'react-select'
import { Variable } from 'models'
import { useDebouncedCallback } from 'use-debounce'
import { isEmpty } from 'utils'
import {
  ButtonOption,
  CancelButton,
  Container,
  FormField,
  FormFieldCol,
  FormFieldRowMin,
  LabelField,
} from './VariableSearchInput.style'
import OctaButton from 'components/octaComponents/OctaButton/OctaButton'
import OctaInput from 'components/octaComponents/OctaInput/OctaInput'
import { CustomFieldTitle } from 'enums/customFieldsTitlesEnum'
import { StepNodeContext } from '../Graph/Nodes/StepNode/StepNode/StepNode'

type Props = {
  initialVariableId?: string
  debounceTimeout?: number
  isDefaultOpen?: boolean
  addVariable?: boolean
  isCloseModal?: boolean
  labelDefault?: string
  isSaveContext?: boolean
  isApi?: boolean
  variablesSelectorIsOpen?: boolean | undefined
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
  ...inputProps
}: Props) => {
  const { onOpen, onClose } = useDisclosure()

  const { typebot, createVariable } = useTypebot()

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
  }

  const myVariable = (typebot?.variables.find(
    (v) => v.id === initialVariableId
  ) ||
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
  const [customVariable, setCustomVariable] = useState<Variable>()

  useOutsideClick({
    ref: dropdownRef,
    handler: onClose,
  })

  useOutsideClick({
    ref: boxRef,
    handler: handleOutsideClick,
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

      if (event.id) {
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

  const handleCreateVariableChange = (
    e: ChangeEvent<HTMLInputElement>
  ): void => {
    const { value } = e.target
    setCustomVariable(
      (state): Variable =>
        ({
          ...state,
          token: value,
          fieldId: value.replace('#', ''),
          name: value.replace('#', ''),
        } as Variable)
    )
  }

  const handleSelectTypeVariable = (type: string) => {
    setCustomVariable(
      (state): Variable =>
        ({
          ...state,
          type,
        } as Variable)
    )
  }

  const formatChars = {
    '*': '[a-zA-Z0-9-]',
  }

  const handleCreateVariable = (): void => {
    const id = 'v' + cuid()
    if (customVariable) {
      const customVariableDraft: Variable = {
        id,
        name: customVariable.name,
        domain: customVariable.domain,
        token: customVariable.token,
        variableId: id,
        example: '',
        fieldId: customVariable.fieldId,
        type: customVariable.type || 'string',
        fixed: true,
      }
      createVariable(customVariableDraft)
      onSelectVariable(customVariableDraft)
      setScreen('VIEWER')
      onClose()
    }
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
              minMenuHeight={50}
              options={options}
              placeholder={inputProps.placeholder ?? 'Selecione a variável'}
              getOptionLabel={(option: Variable) => option.token}
              getOptionValue={(option: Variable) =>
                option.variableId || option.id
              }
            />
          </div>
        </Container>
      )}
      {screen === 'CREATE' && (
        <Container data-screen={screen}>
          <FormField>
            <OctaInput
              placeholder="#nome-do-campo"
              label="Nome do campo"
              mask="#****************************************"
              maskChar={null}
              formatChars={formatChars}
              onChange={handleCreateVariableChange}
            />
          </FormField>
          <FormField style={{ height: '150px' }}>
            <LabelField>Selecione o formato deste campo:</LabelField>
            <FormFieldRowMin>
              <ButtonOption
                className={
                  ['', 'string'].includes(customVariable?.type || '')
                    ? 'active'
                    : ''
                }
                onClick={() => handleSelectTypeVariable('string')}
              >
                Texto
              </ButtonOption>
              <ButtonOption
                className={customVariable?.type === 'date' ? 'active' : ''}
                onClick={() => handleSelectTypeVariable('date')}
              >
                dd/mm/aaaa
              </ButtonOption>
              <ButtonOption
                className={customVariable?.type === 'float' ? 'active' : ''}
                onClick={() => handleSelectTypeVariable('float')}
              >
                123
              </ButtonOption>
              <ButtonOption
                className={customVariable?.type === 'order' ? 'active' : ''}
                onClick={() => handleSelectTypeVariable('order')}
              >
                Pedido
              </ButtonOption>
            </FormFieldRowMin>
            <FormFieldCol>
              <OctaButton onClick={handleCreateVariable}>
                Criar variável
              </OctaButton>
              <CancelButton onClick={handleToggleScreen}>Cancelar</CancelButton>
            </FormFieldCol>
          </FormField>
        </Container>
      )}
    </Flex>
  )
}

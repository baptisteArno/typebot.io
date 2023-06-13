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
  Popover,
  PopoverTrigger,
  Input,
  PopoverContent,
  Button,
  InputProps,
  IconButton,
  HStack,
  Stack
} from '@chakra-ui/react'
import { EditIcon, PlusIcon, TrashIcon } from 'assets/icons'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import { useTypebot } from 'contexts/TypebotContext'
import cuid from 'cuid'
import Select, { StylesConfig, components, GroupProps } from 'react-select'
import { fixedPersonProperties } from 'helpers/presets/variables-presets'
import { Variable } from 'models'
import { useDebouncedCallback } from 'use-debounce'
import { byId, isEmpty, isNotDefined } from 'utils'
import {
  ButtonOption,
  CancelButton,
  Container,
  FormField,
  FormFieldCol,
  FormFieldRowMin,
  LabelField,
  OrText,
  CreateButton,
  SearchInput
} from './VariableSearchInput.style'
import OctaButton from 'components/octaComponents/OctaButton/OctaButton'
import OctaInput from 'components/octaComponents/OctaInput/OctaInput'
import { CustomFieldTitle } from 'enums/customFieldsTitlesEnum'
import { StepNodeContext } from '../Graph/Nodes/StepNode/StepNode/StepNode'

type Props = {
  initialVariableId?: string
  debounceTimeout?: number
  isDefaultOpen?: boolean
  addVariable?: boolean,
  isCloseModal?: boolean,
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
  ...inputProps
}: Props) => {
  const { onOpen, onClose, isOpen } = useDisclosure()
  const { typebot, createVariable, deleteVariable } = useTypebot()

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

  const grouped = typebot?.variables.reduce((acc, current) => {
    if (!acc[current.domain]) {
      acc[current.domain] = {
        label: makeTitle(current.domain),
        options: []
      }
    }
    acc[current.domain].options.push(current)
    return acc
  }, Object.create(null))

  const options = Object.values(grouped)

  const [inputValue, setInputValue] = useState(
    variables.find(byId(initialVariableId))?.token ?? ''
  )
  const debounced = useDebouncedCallback(
    (value) => {
      const variable = variables.find((v) => v.name === value)
      if (variable) onSelectVariable(variable)
    },
    isEmpty(process.env.NEXT_PUBLIC_E2E_TEST) ? debounceTimeout : 0
  )
  const [filteredItems, setFilteredItems] = useState<Variable[]>(
    variables ?? []
  )
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)
  const popoverRef = useRef(null)
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

  const {setIsPopoverOpened} = useContext(StepNodeContext)

  const onInputChange = (event: any): void => {
    if (event && event.id) {
      if (event.token === '') {
        onSelectVariable({} as any)
        setFilteredItems([...variables.slice(0, 50)])
        return
      }
      setInputValue(event.token)
      onSelectVariable(event)
      debounced(event.token)
      onClose()
      setFilteredItems([
        ...variables
          .filter((item) =>
            item.token
              .toLowerCase()
              .includes((event.token ?? '').toLowerCase())
          )
          .slice(0, 50),
      ])
      if (isCloseModal) {
        setIsPopoverOpened?.(false)
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
    setInputValue(e.target.value);
    const { value, name } = e.target
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
        domain: 'CHAT',
        token: customVariable.token,
        variableId: id,
        example: '',
        fieldId: customVariable.fieldId,
        type: customVariable.type,
        fixed: true
      }
      createVariable(customVariableDraft)
      setInputValue(customVariableDraft.token)
      onSelectVariable(customVariableDraft)
      setScreen('VIEWER')
      onClose()
    }
  }

  return (
    <Flex ref={boxRef} w="full" border={'1px'} borderColor={'#e5e7eb'} borderStyle={'solid'} borderRadius={'6px'} >
      {screen === 'VIEWER' && (
        <Container data-screen={screen}>
          Selecione uma variável para salvar a resposta:
          <div>
            <Select
              isClearable={true}
              noOptionsMessage={() => 'Variável não encontrada'}
              onChange={onInputChange}
              minMenuHeight={50}
              options={options}
              placeholder={inputProps.placeholder ?? 'Selecione a variável'}
              getOptionLabel={(option) => option.token}
              />
          </div>
          {addVariable && (
            <Stack>
              <OrText>Ou</OrText>
              <CreateButton onClick={handleToggleScreen}>
                Criar variável
              </CreateButton>
            </Stack>
          )}
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
                  customVariable?.type === 'string' ? 'active' : ''
                }
                onClick={() => handleSelectTypeVariable('string')}
              >
                Texto
              </ButtonOption>
              <ButtonOption
                className={
                  customVariable?.type === 'date' ? 'active' : ''
                }
                onClick={() => handleSelectTypeVariable('date')}
              >
                dd/mm/aaaa
              </ButtonOption>
              <ButtonOption
                className={
                  customVariable?.type === 'float' ? 'active' : ''
                }
                onClick={() => handleSelectTypeVariable('float')}
              >
                123
              </ButtonOption>
              <ButtonOption
                className={
                  customVariable?.type === 'pedido' ? 'active' : ''
                }
                onClick={() => handleSelectTypeVariable('order')}
              >
                Pedido
              </ButtonOption>
            </FormFieldRowMin>
            <FormFieldCol>
              <OctaButton onClick={handleCreateVariable}>
                Criar variável
              </OctaButton>
              <CancelButton onClick={handleToggleScreen}>
                Cancelar
              </CancelButton>
            </FormFieldCol>
          </FormField>
        </Container>
      )}
    </Flex>
  )
}

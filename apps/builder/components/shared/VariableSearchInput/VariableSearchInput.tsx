import React, { useState, useRef, ChangeEvent, useEffect, MouseEvent } from 'react'
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
} from '@chakra-ui/react'
import { EditIcon, PlusIcon, TrashIcon } from 'assets/icons'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import { useTypebot } from 'contexts/TypebotContext'
import cuid from 'cuid'
import { fixedPersonProperties } from 'helpers/presets/variables-presets'
import { Variable } from 'models'
import { useDebouncedCallback } from 'use-debounce'
import { byId, isEmpty, isNotDefined } from 'utils'
// import CustomFields from 'services/octadesk/customFields/customFields'
// import { DomainType, FieldType } from '../../enums/customFieldsEnum'
import { CustomFieldTitle } from '../../../enums/customFieldsTitlesEnum'
import { ButtonOption, CancelButton, Container, FormField, FormFieldRow, FormFieldRowMin, LabelField, OrText } from './VariableSearchInput.style'
import OctaButton from 'components/octaComponents/OctaButton/OctaButton'
import OctaInput from 'components/octaComponents/OctaInput/OctaInput'

type Props = {
  initialVariableId?: string
  debounceTimeout?: number
  isDefaultOpen?: boolean
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
      | 'example'
    >
  ) => void
} & InputProps

export const VariableSearchInput = ({
  initialVariableId,
  onSelectVariable,
  isDefaultOpen,
  debounceTimeout = 1000,
  ...inputProps
}: Props) => {
  const { onOpen, onClose, isOpen } = useDisclosure()
  const {
    typebot,
    createVariable
  } = useTypebot()
  const variables = typebot?.variables ?? []

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

  const [screen, setScreen] = useState<"VIEWER" | "CREATE">("VIEWER");
  const [customVariable, setCustomVariable] = useState<Variable>();

  useOutsideClick({
    ref: dropdownRef,
    handler: onClose,
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

  const fieldTypes = (fieldType: number): string => {
    switch (fieldType) {
      case 4:
        return 'boolean'
      case 5:
        return 'number'
      case 6:
        return 'float'
      case 7:
        return 'date'
      default:
        return 'string'
    }
  }

  const resolveExample = (type: any) => {
    switch (type) {
      case 'string':
        return 'Qualquer texto'
      case 'boolean':
        return 'sim ou não'
      case 'number':
        return '10203040'
      case 'float':
        return '1020,40'
      case 'date':
        return '13/01/0001'
    }

    return ''
  }

  const mountProperties = (properties: any, type: string) => {
    const customProperties = properties.map(
      (h: { fieldType: number; fieldId: string }) => {
        // const type: string = fieldTypes(h.fieldType)
        let tokenValue = `#${h.fieldId.replace(/_/g, '-')}`
        let domainValue = ''
        if (type === 'PERSON') {
          domainValue = CustomFieldTitle.PERSON
          tokenValue = tokenValue.concat('-contato')
        } else if (type === 'CHAT') {
          domainValue = CustomFieldTitle.CHAT
          tokenValue = `#${h.fieldId.replace(/_/g, '-')}`
        } else if (type === 'ORGANIZATION') {
          domainValue = CustomFieldTitle.ORGANIZATION
        }

        const id = 'v' + cuid()

        return {
          type,
          id,
          variableId: id,
          token: tokenValue,
          domain: domainValue,
          name: `customField.${h.fieldId}`,
          example: resolveExample(type),
        }
      }
    )

    return [...customProperties]
  }

  const mountPropertiesOptions = (propertiesType: any, properties: any) => {
    let nameTokenValue = ''
    if (propertiesType === 'PERSON') {
      nameTokenValue = CustomFieldTitle.PERSON
    } else if (propertiesType === 'CHAT') {
      nameTokenValue = CustomFieldTitle.CHAT
    } else if (propertiesType === 'ORGANIZATION') {
      nameTokenValue = CustomFieldTitle.ORGANIZATION
    }

    const propTitle = {
      id: nameTokenValue,
      token: nameTokenValue,
      name: nameTokenValue,
      isTitle: true,
      disabled: true,
    }
    return { propTitle, items: properties }
  }

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    debounced(e.target.value)
    onOpen()
    if (e.target.value === '') {
      onSelectVariable({} as any)
      setFilteredItems([...variables.slice(0, 50)])
      return
    }
    setFilteredItems([
      ...variables
        .filter((item) =>
          item.name.toLowerCase().includes((e.target.value ?? '').toLowerCase())
        )
        .slice(0, 50),
    ])
  }

  const handleVariableNameClick = (variable: Variable): void => {
    console.log("Variable => ", variable);
    setInputValue(variable.token)
    onSelectVariable(variable)
    onClose()
  }

  const handleCreateNewVariableClick = () => {
    if (!inputValue || inputValue === '') return
    const id = 'v' + cuid()
    const variable: Variable = {
      id,
      name: inputValue,
      domain: 'CHAT',
      token: `#${inputValue}`,
      variableId: id,
      example: "",
      fieldId: inputValue,
      type: "",
    }
    createVariable(variable);
    onSelectVariable(variable);
    onClose()
  }

  const handleToggleScreen = (): void => {
    setScreen((e) => {
      if (e === "VIEWER") {
        return "CREATE"
      } else {
        return "VIEWER"
      }
    });
  }

  const handleCreateVariableChange = (e: ChangeEvent<HTMLInputElement>): void => {
    // setInputValue(e.target.value);
    const { value, name } = e.target;
    setCustomVariable((state): Variable => ({
      ...state,
      token: value,
      fieldId: value.replace("#", ""),
      name: value.replace("#", "")
    } as Variable))
  }

  const handleSelectTypeVariable = (type: string) => {
    setCustomVariable((state): Variable => ({
      ...state,
      type,
    } as Variable))
  }

  const handleCreateVariable = (): void => {
    const id = 'v' + cuid()
    if(customVariable){
      const customVariableDraft: Variable = {
        id,
        name: customVariable.name,
        domain: 'CHAT',
        token: customVariable.token,
        variableId: id,
        example: "",
        fieldId: customVariable.fieldId,
        type: customVariable.type,
      }      
      createVariable(customVariableDraft)
      setInputValue(customVariableDraft.token)
      onSelectVariable(customVariableDraft)
      setScreen("VIEWER")
      onClose()
    }
  }

  return (
    <Flex ref={dropdownRef} w="full">
      <Popover
        isOpen={isOpen}
        initialFocusRef={inputRef}
        matchWidth
        isLazy
        offset={[0, 2]}
      >
        <PopoverTrigger>
          <>
            {
              screen === "VIEWER" && (
                <Container>
                  Selecione uma variável para salvar a resposta:
                  <Input
                    data-testid="variables-input"
                    ref={inputRef}
                    value={inputValue}
                    onChange={onInputChange}
                    onClick={onOpen}
                    placeholder={inputProps.placeholder ?? 'Selecione a variável'}
                    {...inputProps}
                  />
                  <OrText>Ou</OrText>
                  <OctaButton onClick={handleToggleScreen}>
                    Criar variável
                  </OctaButton>
                </Container>
              )
            }
            {
              screen === "CREATE" && (
                <Container>
                  <FormField>
                    <OctaInput placeholder="#nome-do-campo" label="Nome do campo" mask="#****************" onChange={handleCreateVariableChange} />
                  </FormField>
                  <FormField style={{height: "150px"}}>
                    <LabelField>
                      Selecione o formato deste campo:
                    </LabelField>
                    <FormFieldRowMin>
                      <ButtonOption className={customVariable?.type === "string" ? "active" : ""} onClick={() => handleSelectTypeVariable("string")}>
                        Texto
                      </ButtonOption>
                      <ButtonOption className={customVariable?.type === "date" ? "active" : ""} onClick={() => handleSelectTypeVariable("date")}>
                        dd/mm/aaaa
                      </ButtonOption>
                      <ButtonOption className={customVariable?.type === "float" ? "active" : ""} onClick={() => handleSelectTypeVariable("float")}>
                        123
                      </ButtonOption>
                      <ButtonOption className={customVariable?.type === "pedido" ? "active" : ""} onClick={() => handleSelectTypeVariable("order")}>
                        Pedido
                      </ButtonOption>
                    </FormFieldRowMin>
                    <FormFieldRow>
                      <OctaButton onClick={handleCreateVariable}>
                        Criar variável
                      </OctaButton>
                      <CancelButton onClick={handleToggleScreen}>
                        Cancelar
                      </CancelButton>
                    </FormFieldRow>
                  </FormField>
                </Container>
              )
            }
          </>
        </PopoverTrigger>
        <PopoverContent
          maxH="35vh"
          overflowY="scroll"
          role="menu"
          w="inherit"
          shadow="lg"
        >
          {variables.length > 0 && (
            <>
              {variables.map((item, idx) => {
                return (
                  <Button
                    role="menuitem"
                    minH="40px"
                    key={idx}
                    onClick={() => handleVariableNameClick(item)}
                    fontSize="16px"
                    fontWeight="normal"
                    rounded="none"
                    colorScheme="gray"
                    variant="ghost"
                    justifyContent="space-between"
                  >
                    {item.token}
                  </Button>
                )
              })}
            </>
          )}
        </PopoverContent>
      </Popover>
    </Flex>
    // <>
    //   <div style={{ width: '100%' }}>
    //     <OctaSelect
    //       options={octaItems.map((item) => ({
    //         label: item.token,
    //         value: item,
    //       }))}
    //       findable
    //       onChange={(item) => handleVariableNameClick(item)}
    //     />
    //   </div>
    // </>
    // <OctaSelect
    //   options={octaItems.map((item) => ({
    //     label: item.token,
    //     value: item,
    //   }))}
    //   findable
    //   onChange={(e) => handleVariableNameClick(e)}
    //   placeholder="Selecione um expediente"
    //   label="Qual horário de expediente este bot irá atender?"
    // ></OctaSelect>
  )
}

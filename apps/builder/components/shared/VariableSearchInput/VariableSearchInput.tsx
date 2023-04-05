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
import { ButtonOption, CancelButton, Container, FormField, FormFieldCol, FormFieldRowMin, LabelField, OrText } from './VariableSearchInput.style'
import OctaButton from 'components/octaComponents/OctaButton/OctaButton'
import OctaInput from 'components/octaComponents/OctaInput/OctaInput'
import { CustomFieldTitle } from 'enums/customFieldsTitlesEnum'

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
    createVariable,
    deleteVariable
  } = useTypebot()

  const variables = typebot?.variables ?? []

  const makeTitle = (propertiesType: string): any => {
    let title;
    switch (propertiesType) {
      case 'PERSON':
        title = CustomFieldTitle.PERSON
        break;
      case 'CHAT':
        title = CustomFieldTitle.CHAT
        break;
      case 'ORGANIZATION':
        title = CustomFieldTitle.ORGANIZATION
        break;
      default:
        title = '';
        break;
    }
    return {
      id: '',
      token: title,
      name: title,
      isTitle: true,
      disabled: true,
    };
  }

  const grouped = typebot?.variables.reduce((acc, current) => {
    acc[current.domain] = acc[current.domain] || []
    acc[current.domain].push(current);

    return acc;
  }, Object.create(null))

  const options = Object.values(grouped).map((group: any, id: number): any => {
    if (Object.keys(grouped)[id] !== 'undefined') {
      return [makeTitle(Object.keys(grouped)[id]), ...group]
    }
  }).filter(item => item != undefined);

  //todo:
  /**
   * - criar um array novo com as variáveis
   * - adiciionar titles antes dos items
   */


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
          item.token.toLowerCase().includes((e.target.value ?? '').toLowerCase())
        )
        .slice(0, 50),
    ])
  }

  const handleVariableNameClick = (variable: Variable): void => {
    setInputValue(variable.token)
    onSelectVariable(variable)
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

  const formatChars = {
    '*': '[a-zA-Z0-9\-]'
  };

  const handleCreateVariable = (): void => {
    const id = 'v' + cuid()
    if (customVariable) {
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
        initialFocusRef={popoverRef}
        matchWidth
        isLazy
        offset={[0, 2]}
        placement='top-start'
        autoFocus
      >
        <PopoverTrigger>
          <>
            {
              screen === "VIEWER" && (
                <Container data-screen={screen}>
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
                <Container data-screen={screen}>
                  <FormField>
                    <OctaInput placeholder="#nome-do-campo" label="Nome do campo" mask="#****************************************" maskChar={null} formatChars={formatChars} onChange={handleCreateVariableChange} />
                  </FormField>
                  <FormField style={{ height: "150px" }}>
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
              {options.flat().map((item, idx) => {
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

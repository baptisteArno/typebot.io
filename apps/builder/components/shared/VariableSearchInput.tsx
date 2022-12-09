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
import React, { useState, useRef, ChangeEvent, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { byId, isEmpty, isNotDefined } from 'utils'
// import CustomFields from 'services/octadesk/customFields/customFields'
// import { DomainType, FieldType } from '../../enums/customFieldsEnum'
import { CustomFieldTitle } from '../../enums/customFieldsTitlesEnum'

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
    deleteVariable,
    updateVariable,
    octaPersonFields,
    octaChatFields,
    octaOrganizationFields,
  } = useTypebot()
  const variables = typebot?.variables ?? []
  console.log('existing typebot', variables)
  const [inputValue, setInputValue] = useState(
    variables.find(byId(initialVariableId))?.name ?? ''
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
  const [octaItems, setOctaItems] = useState<Variable[]>([])
  useEffect(() => {
    const items = []
    const octaChatProperties = mountPropertiesOptions(
      'CHAT',
      mountProperties(octaChatFields, 'CHAT')
    )

    if (octaChatProperties) {
      items.push(octaChatProperties.propTitle, ...octaChatProperties.items)
    }

    const octaPersonProperties = mountPropertiesOptions(
      'PERSON',
      mountProperties(octaPersonFields, 'PERSON').filter(
        (p) => p.type !== 'select'
      )
    )

    if (octaPersonProperties) {
      items.push(octaPersonProperties.propTitle, ...octaPersonProperties.items)
    }

    const octaOrganizationProperties = mountPropertiesOptions(
      'ORGANIZATION',
      mountProperties(octaOrganizationFields, 'ORGANIZATION')
    )

    if (octaOrganizationProperties) {
      items.push(
        octaOrganizationProperties.propTitle,
        ...octaOrganizationProperties.items,
      )
    }
    variables.map(variable => console.log(variable))
    variables.forEach(variable => {
      if (variable.id) {
        deleteVariable(variable.id)
      }
    })
    items.forEach(item => createVariable(item))
    // setOctaItems(items)
    // items.map(item => {
    //   console.log('\n\n\n\n\n\n\n\nitem\n\n\n\n\n\n', item)
    //   const shouldInclude = variables.filter(variable => {
    //     console.log('dentro do filter variable.token', variable.token, item.token)
    //     console.log('dentro do filter item.token', item.token)
    //     return variable.token === item.token
    //   })
    //   console.log('shouldInclude\n', shouldInclude)
    //   console.log('item.token\n', item.token)
    //   if(shouldInclude) {
    //     console.log('!variables.includes(item)', !variables.includes(item))
    //     console.log('item\n', item)
    //     createVariable(item)
    //   }
    // })
    // const test = {
    //   domain: "PERSON",
    //   fieldId: 'TESTE',
    //   example: 'Qualquer texto',
    //   name: 'customField.nome-contato',
    //   token: '#nome-contato',
    //   type: 'string',
    //   variableId: '#nome-contato',
    // }
    // items.push(test);

    // createVariable(test);
    setOctaItems(items)
  }, [])

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

  const handleVariableNameClick = (variable: Variable) => {
    setInputValue(variable.token)
    onSelectVariable(variable)
    onClose()
  }

  const handleCreateNewVariableClick = () => {
    if (!inputValue || inputValue === '') return
    const id = 'v' + cuid()
    // onSelectVariable({
    //   id,
    //   name: inputValue,
    //   domain: 'CHAT',
    //   token: `#${inputValue}`,
    // })
    // createVariable({
    //   id,
    //   name: inputValue,
    //   domain: 'CHAT',
    //   token: `#${inputValue}`,
    //   title: inputValue,
    // })
    onClose()
  }

  return (
    // <Flex ref={dropdownRef} w="full">
    //   <Popover
    //     isOpen={isOpen}
    //     initialFocusRef={inputRef}
    //     matchWidth
    //     isLazy
    //     offset={[0, 2]}
    //   >
    //     <PopoverTrigger>
    //       <Input
    //         data-testid="variables-input"
    //         ref={inputRef}
    //         value={inputValue}
    //         onChange={onInputChange}
    //         onClick={onOpen}
    //         placeholder={inputProps.placeholder ?? 'Selecione a variável'}
    //         {...inputProps}
    //       />
    //     </PopoverTrigger>
    //     <PopoverContent
    //       maxH="35vh"
    //       overflowY="scroll"
    //       role="menu"
    //       w="inherit"
    //       shadow="lg"
    //     >
    //       {(inputValue?.length ?? 0) > 0 &&
    //         isNotDefined(variables.find((v) => v.name === inputValue)) && (
    //           <Button
    //             role="menuitem"
    //             minH="40px"
    //             onClick={handleCreateNewVariableClick}
    //             fontSize="16px"
    //             fontWeight="normal"
    //             rounded="none"
    //             colorScheme="gray"
    //             variant="ghost"
    //             justifyContent="flex-start"
    //             leftIcon={<PlusIcon />}
    //           >
    //             Create "{inputValue}"
    //           </Button>
    //         )}
    //       {octaItems.length > 0 && (
    //         <>
    //           {octaItems.map((item, idx) => {
    //             return (
    //               <Button
    //                 role="menuitem"
    //                 minH="40px"
    //                 key={idx}
    //                 onClick={handleVariableNameClick(item)}
    //                 fontSize="16px"
    //                 fontWeight="normal"
    //                 rounded="none"
    //                 colorScheme="gray"
    //                 variant="ghost"
    //                 justifyContent="space-between"
    //               >
    //                 {item.token}
    //               </Button>
    //             )
    //           })}
    //         </>
    //       )}
    //     </PopoverContent>
    //   </Popover>
    // </Flex>
    <>
      <div style={{ width: '100%' }}>
        <OctaSelect
          options={octaItems.map((item) => ({
            label: item.token,
            value: item,
          }))}
          findable
          onChange={(item) => handleVariableNameClick(item)}
        />
      </div>
    </>
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

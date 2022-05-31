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
import { useTypebot } from 'contexts/TypebotContext'
import cuid from 'cuid'
import { Variable } from 'models'
import React, { useState, useRef, ChangeEvent, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { byId, isEmpty, isNotDefined } from 'utils'

type Props = {
  initialVariableId?: string
  debounceTimeout?: number
  isDefaultOpen?: boolean
  onSelectVariable: (
    variable: Pick<Variable, 'id' | 'name'> | undefined
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
  const { typebot, createVariable, deleteVariable, updateVariable } =
    useTypebot()
  const variables = typebot?.variables ?? []
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

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    debounced(e.target.value)
    onOpen()
    if (e.target.value === '') {
      onSelectVariable(undefined)
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

  const handleVariableNameClick = (variable: Variable) => () => {
    setInputValue(variable.name)
    onSelectVariable(variable)
    onClose()
  }

  const handleCreateNewVariableClick = () => {
    if (!inputValue || inputValue === '') return
    const id = 'v' + cuid()
    onSelectVariable({ id, name: inputValue })
    createVariable({ id, name: inputValue })
    onClose()
  }

  const handleDeleteVariableClick =
    (variable: Variable) => (e: React.MouseEvent) => {
      e.stopPropagation()
      deleteVariable(variable.id)
      setFilteredItems(filteredItems.filter((item) => item.id !== variable.id))
      if (variable.name === inputValue) {
        setInputValue('')
        debounced('')
      }
    }

  const handleRenameVariableClick =
    (variable: Variable) => (e: React.MouseEvent) => {
      e.stopPropagation()
      const name = prompt('Rename variable', variable.name)
      if (!name) return
      updateVariable(variable.id, { name })
      setFilteredItems(
        filteredItems.map((item) =>
          item.id === variable.id ? { ...item, name } : item
        )
      )
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
          <Input
            data-testid="variables-input"
            ref={inputRef}
            value={inputValue}
            onChange={onInputChange}
            onClick={onOpen}
            placeholder={inputProps.placeholder ?? 'Select a variable'}
            {...inputProps}
          />
        </PopoverTrigger>
        <PopoverContent
          maxH="35vh"
          overflowY="scroll"
          role="menu"
          w="inherit"
          shadow="lg"
        >
          {(inputValue?.length ?? 0) > 0 &&
            isNotDefined(variables.find((v) => v.name === inputValue)) && (
              <Button
                role="menuitem"
                minH="40px"
                onClick={handleCreateNewVariableClick}
                fontSize="16px"
                fontWeight="normal"
                rounded="none"
                colorScheme="gray"
                variant="ghost"
                justifyContent="flex-start"
                leftIcon={<PlusIcon />}
              >
                Create "{inputValue}"
              </Button>
            )}
          {filteredItems.length > 0 && (
            <>
              {filteredItems.map((item, idx) => {
                return (
                  <Button
                    role="menuitem"
                    minH="40px"
                    key={idx}
                    onClick={handleVariableNameClick(item)}
                    fontSize="16px"
                    fontWeight="normal"
                    rounded="none"
                    colorScheme="gray"
                    variant="ghost"
                    justifyContent="space-between"
                  >
                    {item.name}
                    <HStack>
                      <IconButton
                        icon={<EditIcon />}
                        aria-label="Rename variable"
                        size="xs"
                        onClick={handleRenameVariableClick(item)}
                      />
                      <IconButton
                        icon={<TrashIcon />}
                        aria-label="Remove variable"
                        size="xs"
                        onClick={handleDeleteVariableClick(item)}
                      />
                    </HStack>
                  </Button>
                )
              })}
            </>
          )}
        </PopoverContent>
      </Popover>
    </Flex>
  )
}

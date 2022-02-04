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
} from '@chakra-ui/react'
import { PlusIcon, TrashIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext'
import { Variable } from 'models'
import React, { useState, useRef, ChangeEvent, useEffect } from 'react'
import { generate } from 'short-uuid'
import { useDebounce } from 'use-debounce'
import { byId, isNotDefined } from 'utils'

type Props = {
  initialVariableId?: string
  onSelectVariable: (
    variable: Pick<Variable, 'id' | 'name'> | undefined
  ) => void
  isDefaultOpen?: boolean
} & InputProps

export const VariableSearchInput = ({
  initialVariableId,
  onSelectVariable,
  isDefaultOpen,
  ...inputProps
}: Props) => {
  const { onOpen, onClose, isOpen } = useDisclosure()
  const { typebot, createVariable, deleteVariable } = useTypebot()
  const variables = typebot?.variables ?? []
  const [inputValue, setInputValue] = useState(
    variables.find(byId(initialVariableId))?.name ?? ''
  )
  const [debouncedInputValue] = useDebounce(inputValue, 200)
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

  useEffect(() => {
    const variable = variables.find((v) => v.name === debouncedInputValue)
    if (variable) onSelectVariable(variable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInputValue])

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    onOpen()
    if (e.target.value === '') {
      setFilteredItems([...variables.slice(0, 50)])
      onSelectVariable(undefined)
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
    const id = generate()
    createVariable({ id, name: inputValue })
    onSelectVariable({ id, name: inputValue })
    onClose()
  }

  const handleDeleteVariableClick =
    (variable: Variable) => (e: React.MouseEvent) => {
      e.stopPropagation()
      deleteVariable(variable.id)
      setFilteredItems(filteredItems.filter((item) => item.id !== variable.id))
      if (variable.name === inputValue) setInputValue('')
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
          spacing="0"
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
                    <IconButton
                      icon={<TrashIcon />}
                      aria-label="Remove variable"
                      size="xs"
                      onClick={handleDeleteVariableClick(item)}
                    />
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

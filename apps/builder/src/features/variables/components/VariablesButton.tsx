import {
  Popover,
  PopoverTrigger,
  Flex,
  Tooltip,
  IconButton,
  PopoverContent,
  IconButtonProps,
} from '@chakra-ui/react'
import { UserIcon } from '@/components/icons'
import { Variable } from 'models'
import React from 'react'
import { VariableSearchInput } from '@/components/VariableSearchInput'

type Props = {
  onSelectVariable: (
    variable: Pick<Variable, 'name' | 'id'> | undefined
  ) => void
} & Omit<IconButtonProps, 'aria-label'>

export const VariablesButton = ({ onSelectVariable, ...props }: Props) => {
  return (
    <Popover isLazy placement="bottom-end" gutter={0}>
      <PopoverTrigger>
        <Flex>
          <Tooltip label="Insert a variable">
            <IconButton
              aria-label={'Insert a variable'}
              icon={<UserIcon />}
              pos="relative"
              {...props}
            />
          </Tooltip>
        </Flex>
      </PopoverTrigger>
      <PopoverContent w="full">
        <VariableSearchInput
          onSelectVariable={onSelectVariable}
          placeholder="Search for a variable"
          shadow="lg"
          isDefaultOpen
        />
      </PopoverContent>
    </Popover>
  )
}

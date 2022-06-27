import {
  Popover,
  PopoverTrigger,
  Flex,
  Tooltip,
  IconButton,
  PopoverContent,
  IconButtonProps,
} from '@chakra-ui/react'
import { UserIcon } from 'assets/icons'
import { Variable } from 'models'
import React from 'react'
import { VariableSearchInput } from '../VariableSearchInput'

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
          <Tooltip label="Insira uma variável">
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
          placeholder="Pesquise sua variável"
          shadow="lg"
          isDefaultOpen
        />
      </PopoverContent>
    </Popover>
  )
}

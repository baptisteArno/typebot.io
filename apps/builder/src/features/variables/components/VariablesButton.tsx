import {
  Popover,
  Flex,
  Tooltip,
  IconButton,
  PopoverContent,
  IconButtonProps,
  useDisclosure,
  PopoverAnchor,
  Portal,
} from '@chakra-ui/react'
import { UserIcon } from '@/components/icons'
import { Variable } from '@typebot.io/schemas'
import React, { useRef } from 'react'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { useParentModal } from '@/features/graph/providers/ParentModalProvider'

type Props = {
  onSelectVariable: (variable: Pick<Variable, 'name' | 'id'>) => void
} & Omit<IconButtonProps, 'aria-label'>

export const VariablesButton = ({ onSelectVariable, ...props }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const popoverRef = useRef<HTMLDivElement>(null)
  const { ref: parentModalRef } = useParentModal()

  useOutsideClick({
    ref: popoverRef,
    handler: onClose,
    isEnabled: isOpen,
  })

  return (
    <Popover isLazy isOpen={isOpen}>
      <PopoverAnchor>
        <Flex>
          <Tooltip label="Insert a variable">
            <IconButton
              aria-label={'Insert a variable'}
              icon={<UserIcon />}
              pos="relative"
              onClick={onOpen}
              {...props}
            />
          </Tooltip>
        </Flex>
      </PopoverAnchor>
      <Portal containerRef={parentModalRef}>
        <PopoverContent w="full" ref={popoverRef}>
          <VariableSearchInput
            initialVariableId={undefined}
            onSelectVariable={(variable) => {
              onClose()
              if (variable) onSelectVariable(variable)
            }}
            placeholder="Search for a variable"
            shadow="lg"
            autoFocus
          />
        </PopoverContent>
      </Portal>
    </Popover>
  )
}

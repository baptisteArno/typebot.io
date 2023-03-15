import { Button, ButtonProps, useDisclosure } from '@chakra-ui/react'
import { useWorkspace } from '@/features/workspace'
import React from 'react'
import { isNotDefined } from '@typebot.io/lib'
import { ChangePlanModal } from './ChangePlanModal'
import { LimitReached } from './ChangePlanModal'

type Props = { limitReachedType?: LimitReached } & ButtonProps

export const UpgradeButton = ({ limitReachedType, ...props }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { workspace } = useWorkspace()
  return (
    <Button
      colorScheme="blue"
      {...props}
      isLoading={isNotDefined(workspace)}
      onClick={onOpen}
    >
      {props.children ?? 'Upgrade'}
      <ChangePlanModal
        isOpen={isOpen}
        onClose={onClose}
        type={limitReachedType}
      />
    </Button>
  )
}

import { Button, ButtonProps, useDisclosure } from '@chakra-ui/react'
import { useWorkspace } from 'contexts/WorkspaceContext'
import React from 'react'
import { isNotDefined } from 'utils'
import { ChangePlanModal } from '../modals/ChangePlanModal'
import { LimitReached } from '../modals/ChangePlanModal'

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

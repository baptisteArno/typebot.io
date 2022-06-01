import { Button, ButtonProps, useDisclosure } from '@chakra-ui/react'
import { useWorkspace } from 'contexts/WorkspaceContext'
import { Plan } from 'db'
import React from 'react'
import { isNotDefined } from 'utils'
import { UpgradeModal } from '../modals/UpgradeModal'
import { LimitReached } from '../modals/UpgradeModal/UpgradeModal'

type Props = { plan?: Plan; type?: LimitReached } & ButtonProps

export const UpgradeButton = ({ type, plan = Plan.PRO, ...props }: Props) => {
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
      <UpgradeModal isOpen={isOpen} onClose={onClose} type={type} plan={plan} />
    </Button>
  )
}

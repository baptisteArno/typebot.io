import { Button, ButtonProps, useDisclosure } from '@chakra-ui/react'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import React from 'react'
import { isNotDefined } from '@typebot.io/lib'
import { ChangePlanModal } from './ChangePlanModal'
import { useI18n } from '@/locales'

type Props = { limitReachedType?: string } & ButtonProps

export const UpgradeButton = ({ limitReachedType, ...props }: Props) => {
  const t = useI18n()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { workspace } = useWorkspace()
  return (
    <Button
      colorScheme="blue"
      {...props}
      isLoading={isNotDefined(workspace)}
      onClick={onOpen}
    >
      {props.children ?? t('upgrade')}
      <ChangePlanModal
        isOpen={isOpen}
        onClose={onClose}
        type={limitReachedType}
      />
    </Button>
  )
}

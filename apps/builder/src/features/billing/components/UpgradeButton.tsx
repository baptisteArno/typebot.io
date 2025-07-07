import { Button, ButtonProps, useDisclosure } from '@chakra-ui/react'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import React from 'react'
import { isNotDefined } from '@typebot.io/lib'
import { ChangePlanModal } from './ChangePlanModal'
import { useTranslate } from '@tolgee/react'

type Props = {
  limitReachedType?: string
  excludedPlans?: ('STARTER' | 'PRO')[]
} & ButtonProps

export const UpgradeButton = ({
  limitReachedType,
  excludedPlans,
  ...props
}: Props) => {
  const { t } = useTranslate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { workspace } = useWorkspace()
  return (
    <Button
      colorScheme="orange"
      {...props}
      isLoading={isNotDefined(workspace)}
      onClick={onOpen}
    >
      {props.children ?? t('upgrade')}
      <ChangePlanModal
        isOpen={isOpen}
        onClose={onClose}
        type={limitReachedType}
        excludedPlans={excludedPlans}
      />
    </Button>
  )
}

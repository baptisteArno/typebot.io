import { Button, HStack, useDisclosure, Text } from '@chakra-ui/react'
import { FolderPlusIcon } from '@/components/icons'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { Plan } from '@typebot.io/prisma'
import React from 'react'
import { useI18n, useScopedI18n } from '@/locales'
import { ChangePlanModal } from '@/features/billing/components/ChangePlanModal'
import { LockTag } from '@/features/billing/components/LockTag'
import { isFreePlan } from '@/features/billing/helpers/isFreePlan'

type Props = { isLoading: boolean; onClick: () => void }

export const CreateFolderButton = ({ isLoading, onClick }: Props) => {
  const t = useI18n()
  const scopedT = useScopedI18n('folders.createFolderButton')
  const { workspace } = useWorkspace()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleClick = () => {
    if (isFreePlan(workspace)) return onOpen()
    onClick()
  }
  return (
    <Button
      leftIcon={<FolderPlusIcon />}
      onClick={handleClick}
      isLoading={isLoading}
    >
      <HStack>
        <Text>{scopedT('label')}</Text>
        {isFreePlan(workspace) && <LockTag plan={Plan.STARTER} />}
      </HStack>
      <ChangePlanModal
        isOpen={isOpen}
        onClose={onClose}
        type={t('billing.limitMessage.folder')}
      />
    </Button>
  )
}

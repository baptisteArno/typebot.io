import { Button, HStack, useDisclosure, Text } from '@chakra-ui/react'
import { FolderPlusIcon } from '@/components/icons'
import {
  LimitReached,
  ChangePlanModal,
  LockTag,
  isFreePlan,
} from '@/features/billing'
import { useWorkspace } from '@/features/workspace'
import { Plan } from '@typebot.io/prisma'
import React from 'react'
import { useScopedI18n } from '@/locales'

type Props = { isLoading: boolean; onClick: () => void }

export const CreateFolderButton = ({ isLoading, onClick }: Props) => {
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
        type={LimitReached.FOLDER}
      />
    </Button>
  )
}

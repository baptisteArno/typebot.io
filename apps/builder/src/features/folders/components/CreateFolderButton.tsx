import { Button, HStack, useDisclosure, Text } from '@chakra-ui/react'
import { FolderPlusIcon } from '@/components/icons'
import {
  LimitReached,
  ChangePlanModal,
  LockTag,
  isFreePlan,
} from '@/features/billing'
import { useWorkspace } from '@/features/workspace'
import { Plan } from 'db'
import React from 'react'

type Props = { isLoading: boolean; onClick: () => void }

export const CreateFolderButton = ({ isLoading, onClick }: Props) => {
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
        <Text>Create a folder</Text>
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

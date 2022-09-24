import { Button, HStack, useDisclosure, Text } from '@chakra-ui/react'
import { FolderPlusIcon } from 'assets/icons'
import {
  LimitReached,
  ChangePlanModal,
} from 'components/shared/modals/ChangePlanModal'
import { PlanTag } from 'components/shared/PlanTag'
import { useWorkspace } from 'contexts/WorkspaceContext'
import { Plan } from 'db'
import React from 'react'
import { isFreePlan } from 'services/workspace'

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
        {isFreePlan(workspace) && <PlanTag plan={Plan.STARTER} />}
      </HStack>
      <ChangePlanModal
        isOpen={isOpen}
        onClose={onClose}
        type={LimitReached.FOLDER}
      />
    </Button>
  )
}

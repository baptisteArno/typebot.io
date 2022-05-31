import { Button, HStack, Tag, useDisclosure, Text } from '@chakra-ui/react'
import { FolderPlusIcon } from 'assets/icons'
import { UpgradeModal } from 'components/shared/modals/UpgradeModal'
import { LimitReached } from 'components/shared/modals/UpgradeModal/UpgradeModal'
import { useWorkspace } from 'contexts/WorkspaceContext'
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
        {isFreePlan(workspace) && <Tag colorScheme="orange">Pro</Tag>}
      </HStack>
      <UpgradeModal
        isOpen={isOpen}
        onClose={onClose}
        type={LimitReached.FOLDER}
      />
    </Button>
  )
}

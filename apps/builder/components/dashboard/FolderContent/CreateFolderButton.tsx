import { Button, HStack, Tag, useDisclosure, Text } from '@chakra-ui/react'
import { FolderPlusIcon } from 'assets/icons'
import { UpgradeModal } from 'components/shared/modals/UpgradeModal'
import { LimitReached } from 'components/shared/modals/UpgradeModal/UpgradeModal'
import { useUser } from 'contexts/UserContext'
import React from 'react'
import { isFreePlan } from 'services/user'

type Props = { isLoading: boolean; onClick: () => void }

export const CreateFolderButton = ({ isLoading, onClick }: Props) => {
  const { user } = useUser()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleClick = () => {
    if (isFreePlan(user)) return onOpen()
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
        {isFreePlan(user) && <Tag colorScheme="orange">Pro</Tag>}
      </HStack>
      <UpgradeModal
        isOpen={isOpen}
        onClose={onClose}
        type={LimitReached.FOLDER}
      />
    </Button>
  )
}

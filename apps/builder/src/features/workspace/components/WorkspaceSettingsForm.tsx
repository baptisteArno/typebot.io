import {
  Stack,
  FormControl,
  FormLabel,
  Flex,
  Button,
  useDisclosure,
  Text,
} from '@chakra-ui/react'
import { ConfirmModal } from '@/components/ConfirmModal'
import React from 'react'
import { EditableEmojiOrImageIcon } from '@/components/EditableEmojiOrImageIcon'
import { useWorkspace } from '../WorkspaceProvider'
import { TextInput } from '@/components/inputs'

export const WorkspaceSettingsForm = ({ onClose }: { onClose: () => void }) => {
  const { workspace, workspaces, updateWorkspace, deleteCurrentWorkspace } =
    useWorkspace()

  const handleNameChange = (name: string) => {
    if (!workspace?.id) return
    updateWorkspace({ name })
  }

  const handleChangeIcon = (icon: string) => {
    updateWorkspace({ icon })
  }

  const handleDeleteClick = async () => {
    await deleteCurrentWorkspace()
    onClose()
  }

  return (
    <Stack spacing="6" w="full">
      <FormControl>
        <FormLabel>Icon</FormLabel>
        <Flex>
          {workspace && (
            <EditableEmojiOrImageIcon
              uploadFilePath={`workspaces/${workspace.id}/icon`}
              icon={workspace.icon}
              onChangeIcon={handleChangeIcon}
              boxSize="40px"
            />
          )}
        </Flex>
      </FormControl>
      {workspace && (
        <TextInput
          label="Name:"
          withVariableButton={false}
          defaultValue={workspace?.name}
          onChange={handleNameChange}
        />
      )}
      {workspace && workspaces && workspaces.length > 1 && (
        <DeleteWorkspaceButton
          onConfirm={handleDeleteClick}
          workspaceName={workspace?.name}
        />
      )}
    </Stack>
  )
}

const DeleteWorkspaceButton = ({
  workspaceName,
  onConfirm,
}: {
  workspaceName: string
  onConfirm: () => Promise<void>
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button colorScheme="red" variant="outline" onClick={onOpen}>
        Delete workspace
      </Button>
      <ConfirmModal
        isOpen={isOpen}
        onConfirm={onConfirm}
        onClose={onClose}
        message={
          <Text>
            Are you sure you want to delete {workspaceName} workspace? All its
            folders, typebots and results will be deleted forever.
          </Text>
        }
        confirmButtonLabel="Delete"
      />
    </>
  )
}

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
import { useScopedI18n } from '@/locales'

export const WorkspaceSettingsForm = ({ onClose }: { onClose: () => void }) => {
  const scopedT = useScopedI18n('workspace.settings')
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
        <FormLabel>{scopedT('icon.title')}</FormLabel>
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
          label={scopedT('name.label')}
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
  const scopedT = useScopedI18n('workspace.settings')
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button colorScheme="red" variant="outline" onClick={onOpen}>
        {scopedT('deleteButton.label')}
      </Button>
      <ConfirmModal
        isOpen={isOpen}
        onConfirm={onConfirm}
        onClose={onClose}
        message={
          <Text>
            {scopedT('deleteButton.confirmMessage', {
              workspaceName,
            })}
          </Text>
        }
        confirmButtonLabel="Delete"
      />
    </>
  )
}

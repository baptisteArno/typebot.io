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
import { useTranslate } from '@tolgee/react'

export const WorkspaceSettingsForm = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslate()
  const { workspace, workspaces, updateWorkspace, deleteCurrentWorkspace } =
    useWorkspace()

  const handleNameChange = (name: string) => {
    if (!workspace?.id) return
    updateWorkspace({ name })
  }

  const handleChangeIcon = (icon: string) => updateWorkspace({ icon })

  const handleDeleteClick = async () => {
    await deleteCurrentWorkspace()
    onClose()
  }

  return (
    <Stack spacing="6" w="full">
      <FormControl>
        <FormLabel>{t('workspace.settings.icon.title')}</FormLabel>
        <Flex>
          {workspace && (
            <EditableEmojiOrImageIcon
              uploadFileProps={{
                workspaceId: workspace.id,
                fileName: 'icon',
              }}
              icon={workspace.icon}
              onChangeIcon={handleChangeIcon}
              boxSize="40px"
            />
          )}
        </Flex>
      </FormControl>
      {workspace && (
        <TextInput
          label={t('workspace.settings.name.label')}
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
  const { t } = useTranslate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button colorScheme="red" variant="outline" onClick={onOpen}>
        {t('workspace.settings.deleteButton.label')}
      </Button>
      <ConfirmModal
        isOpen={isOpen}
        onConfirm={onConfirm}
        onClose={onClose}
        message={
          <Text>
            {t('workspace.settings.deleteButton.confirmMessage', {
              workspaceName,
            })}
          </Text>
        }
        confirmButtonLabel="Delete"
      />
    </>
  )
}

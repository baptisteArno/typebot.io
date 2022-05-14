import { Stack, FormControl, FormLabel, Flex } from '@chakra-ui/react'
import { EditableEmojiOrImageIcon } from 'components/shared/EditableEmojiOrImageIcon'
import { Input } from 'components/shared/Textbox'
import { useWorkspace } from 'contexts/WorkspaceContext'
import React from 'react'

export const WorkspaceSettingsForm = () => {
  const { workspace, updateWorkspace } = useWorkspace()

  const handleNameChange = (name: string) => {
    if (!workspace?.id) return
    updateWorkspace(workspace?.id, { name })
  }

  const handleChangeIcon = (icon: string) => {
    if (!workspace?.id) return
    updateWorkspace(workspace?.id, { icon })
  }

  return (
    <Stack spacing="6" w="full">
      <FormControl>
        <FormLabel>Icon</FormLabel>
        <Flex>
          <EditableEmojiOrImageIcon
            icon={workspace?.icon}
            onChangeIcon={handleChangeIcon}
            boxSize="40px"
          />
        </Flex>
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="name">Name</FormLabel>
        {workspace && (
          <Input
            id="name"
            withVariableButton={false}
            defaultValue={workspace?.name}
            onChange={handleNameChange}
          />
        )}
      </FormControl>
    </Stack>
  )
}

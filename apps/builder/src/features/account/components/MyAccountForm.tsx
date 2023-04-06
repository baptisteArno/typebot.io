import { Stack, HStack, Avatar, Text, Tooltip } from '@chakra-ui/react'
import { UploadIcon } from '@/components/icons'
import React, { useState } from 'react'
import { ApiTokensList } from './ApiTokensList'
import { UploadButton } from '@/components/ImageUploadContent/UploadButton'
import { useUser } from '../hooks/useUser'
import { TextInput } from '@/components/inputs/TextInput'
import { useScopedI18n } from '@/locales'

export const MyAccountForm = () => {
  const scopedT = useScopedI18n('account.myAccount')
  const { user, updateUser } = useUser()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')

  const handleFileUploaded = async (url: string) => {
    updateUser({ image: url })
  }

  const handleNameChange = (newName: string) => {
    setName(newName)
    updateUser({ name: newName })
  }

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail)
    updateUser({ email: newEmail })
  }

  return (
    <Stack spacing="6" w="full" overflowY="scroll">
      <HStack spacing={6}>
        <Avatar
          size="lg"
          src={user?.image ?? undefined}
          name={user?.name ?? undefined}
        />
        <Stack>
          <UploadButton
            size="sm"
            fileType="image"
            filePath={`users/${user?.id}/avatar`}
            leftIcon={<UploadIcon />}
            onFileUploaded={handleFileUploaded}
          >
            {scopedT('changePhotoButton.label')}
          </UploadButton>
          <Text color="gray.500" fontSize="sm">
            {scopedT('changePhotoButton.specification')}
          </Text>
        </Stack>
      </HStack>

      <TextInput
        defaultValue={name}
        onChange={handleNameChange}
        label={scopedT('nameInput.label')}
        withVariableButton={false}
        debounceTimeout={0}
      />
      <Tooltip label={scopedT('emailInput.disabledTooltip')}>
        <span>
          <TextInput
            type="email"
            defaultValue={email}
            onChange={handleEmailChange}
            label={scopedT('emailInput.label')}
            withVariableButton={false}
            debounceTimeout={0}
            isDisabled
          />
        </span>
      </Tooltip>

      {user && <ApiTokensList user={user} />}
    </Stack>
  )
}

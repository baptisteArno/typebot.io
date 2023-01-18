import { Stack, HStack, Avatar, Text, Tooltip } from '@chakra-ui/react'
import { UploadIcon } from '@/components/icons'
import React, { useState } from 'react'
import { ApiTokensList } from './ApiTokensList'
import { UploadButton } from '@/components/ImageUploadContent/UploadButton'
import { useUser } from '@/features/account'
import { Input } from '@/components/inputs/Input'

export const MyAccountForm = () => {
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
            Change photo
          </UploadButton>
          <Text color="gray.500" fontSize="sm">
            .jpg or.png, max 1MB
          </Text>
        </Stack>
      </HStack>

      <Input
        value={name}
        onChange={handleNameChange}
        label="Name:"
        withVariableButton={false}
        debounceTimeout={0}
      />
      <Tooltip label="Updating email is not available. Contact the support if you want to change it.">
        <span>
          <Input
            type="email"
            value={email}
            onChange={handleEmailChange}
            label="Email address:"
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

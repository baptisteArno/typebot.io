import {
  Stack,
  Heading,
  HStack,
  Avatar,
  Button,
  FormControl,
  FormLabel,
  Input,
  Tooltip,
  Flex,
  Text,
} from '@chakra-ui/react'
import { UploadIcon } from 'assets/icons'
import { UploadButton } from 'components/shared/buttons/UploadButton'
import { useUser } from 'contexts/UserContext'
import React, { ChangeEvent, useState } from 'react'
import { uploadFile } from 'services/utils'

export const PersonalInfoForm = () => {
  const {
    user,
    updateUser,
    saveUser,
    hasUnsavedChanges,
    isSaving,
    isOAuthProvider,
  } = useUser()
  const [reloadParam, setReloadParam] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (file: File) => {
    setIsUploading(true)
    const { url } = await uploadFile(file, `${user?.id}/avatar`)
    setReloadParam(Date.now().toString())
    updateUser({ image: url })
    setIsUploading(false)
  }

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateUser({ name: e.target.value })
  }

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateUser({ email: e.target.value })
  }

  return (
    <Stack direction="row" spacing="10" justifyContent={'space-between'}>
      <Heading as="h2" fontSize="xl">
        Personal info
      </Heading>
      <Stack spacing="6" w="400px">
        <HStack spacing={6}>
          <Avatar
            size="lg"
            src={user?.image ? `${user.image}?${reloadParam}` : undefined}
            name={user?.name ?? undefined}
          />
          <Stack>
            <UploadButton
              size="sm"
              leftIcon={<UploadIcon />}
              isLoading={isUploading}
              onUploadChange={handleFileChange}
            >
              Change photo
            </UploadButton>
            <Text color="gray.500" fontSize="sm">
              .jpg or.png, max 1MB
            </Text>
          </Stack>
        </HStack>

        <FormControl>
          <FormLabel htmlFor="name">Name</FormLabel>
          <Input
            id="name"
            value={user?.name ?? ''}
            onChange={handleNameChange}
          />
        </FormControl>
        <Tooltip
          label="Can't update the email because it is linked to an OAuth service"
          placement="left"
          hasArrow
          isDisabled={!isOAuthProvider}
        >
          <FormControl>
            <FormLabel
              htmlFor="email"
              color={isOAuthProvider ? 'gray.500' : 'current'}
            >
              Email address
            </FormLabel>
            <Input
              id="email"
              type="email"
              isDisabled={isOAuthProvider}
              value={user?.email ?? ''}
              onChange={handleEmailChange}
            />
          </FormControl>
        </Tooltip>

        {hasUnsavedChanges && (
          <Flex justifyContent="flex-end">
            <Button colorScheme="blue" onClick={saveUser} isLoading={isSaving}>
              Save
            </Button>
          </Flex>
        )}
      </Stack>
    </Stack>
  )
}

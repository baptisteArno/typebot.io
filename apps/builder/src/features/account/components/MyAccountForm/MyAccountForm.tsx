import {
  Stack,
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
import { UploadIcon } from '@/components/icons'
import React, { ChangeEvent } from 'react'
import { isDefined } from 'utils'
import { ApiTokensList } from './ApiTokensList'
import { UploadButton } from '@/components/ImageUploadContent/UploadButton'
import { useUser } from '@/features/account'

export const MyAccountForm = () => {
  const {
    user,
    updateUser,
    saveUser,
    hasUnsavedChanges,
    isSaving,
    isOAuthProvider,
  } = useUser()

  const handleFileUploaded = async (url: string) => {
    updateUser({ image: url })
  }

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateUser({ name: e.target.value })
  }

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateUser({ email: e.target.value })
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

      <FormControl>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input id="name" value={user?.name ?? ''} onChange={handleNameChange} />
      </FormControl>
      {isDefined(user?.email) && (
        <Tooltip
          label="Updating email is not available."
          placement="left"
          hasArrow
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
              isDisabled
              value={user?.email ?? ''}
              onChange={handleEmailChange}
            />
          </FormControl>
        </Tooltip>
      )}

      {hasUnsavedChanges && (
        <Flex justifyContent="flex-end">
          <Button
            colorScheme="blue"
            onClick={() => saveUser()}
            isLoading={isSaving}
          >
            Save
          </Button>
        </Flex>
      )}

      {user && <ApiTokensList user={user} />}
    </Stack>
  )
}

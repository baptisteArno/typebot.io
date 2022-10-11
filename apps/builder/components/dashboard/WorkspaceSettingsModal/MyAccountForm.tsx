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
  InputRightElement,
  InputGroup,
} from '@chakra-ui/react'
import { UploadIcon } from 'assets/icons'
import { UploadButton } from 'components/shared/buttons/UploadButton'
import { useUser } from 'contexts/UserContext'
import React, { ChangeEvent, useState } from 'react'
import { isDefined } from 'utils'

export const MyAccountForm = () => {
  const {
    user,
    updateUser,
  } = useUser()
  const [reloadParam, setReloadParam] = useState('')
  const [isApiTokenVisible, setIsApiTokenVisible] = useState(false)

  const handleFileUploaded = async (url: string) => {
    setReloadParam(Date.now().toString())
    updateUser({ image: url })
  }

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateUser({ name: e.target.value })
  }

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateUser({ email: e.target.value })
  }

  const toggleTokenVisibility = () => setIsApiTokenVisible(!isApiTokenVisible)

  return (
    <Stack spacing="6" w="full">
      <HStack spacing={6}>
        <Avatar
          size="lg"
          src={user?.image ? `${user.image}?${reloadParam}` : undefined}
          name={user?.name ?? undefined}
        />
        <Stack>
          <UploadButton
            size="sm"
            filePath={`public/users/${user?.id}/avatar`}
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
              color="current"
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
      <FormControl>
        <FormLabel htmlFor="name">API token</FormLabel>
        <InputGroup>
          <Input
            id="token"
            value={user?.apiToken ?? ''}
            type={isApiTokenVisible ? 'text' : 'password'}
          />
          <InputRightElement mr="3">
            <Button size="xs" onClick={toggleTokenVisibility}>
              {isApiTokenVisible ? 'Hide' : 'Show'}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      {/* {hasUnsavedChanges && (
        <Flex justifyContent="flex-end">
          <Button
            colorScheme="blue"
            onClick={() => saveUser()}
            isLoading={isSaving}
          >
            Save
          </Button>
        </Flex>
      )} */}
    </Stack>
  )
}

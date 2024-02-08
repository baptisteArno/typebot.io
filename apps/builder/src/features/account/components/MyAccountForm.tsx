import {
  Stack,
  HStack,
  Avatar,
  Text,
  Input,
  InputGroup,
  InputRightElement,
  FormHelperText,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { UploadIcon } from '@/components/icons'
import React, { useState } from 'react'
// import { ApiTokensList } from './ApiTokensList'
import { UploadButton } from '@/components/ImageUploadContent/UploadButton'
import { useUser } from '../hooks/useUser'
import { TextInput } from '@/components/inputs/TextInput'
import { useTranslate } from '@tolgee/react'
import { CopyButton } from '@/components/CopyButton'

export const MyAccountForm = () => {
  const { t } = useTranslate()
  const { user, updateUser } = useUser()
  const [name, setName] = useState(user?.name ?? '')
  // const [email, setEmail] = useState(user?.email ?? '')
  const [email] = useState(user?.email ?? '')

  const handleFileUploaded = async (url: string) => {
    updateUser({ image: url })
  }

  const handleNameChange = (newName: string) => {
    setName(newName)
    updateUser({ name: newName })
  }

  // const handleEmailChange = (newEmail: string) => {
  //   setEmail(newEmail)
  //   updateUser({ email: newEmail })
  // }

  return (
    <Stack spacing="6" w="full" overflowY="auto">
      <HStack spacing={6}>
        <Avatar
          size="lg"
          src={user?.image ?? undefined}
          name={user?.name ?? undefined}
        />
        <Stack>
          {user?.id && (
            <UploadButton
              size="sm"
              fileType="image"
              filePathProps={{
                userId: user.id,
                fileName: 'avatar',
              }}
              leftIcon={<UploadIcon />}
              onFileUploaded={handleFileUploaded}
            >
              {t('account.myAccount.changePhotoButton.label')}
            </UploadButton>
          )}
          <Text color="gray.500" fontSize="sm">
            {t('account.myAccount.changePhotoButton.specification')}
          </Text>
        </Stack>
      </HStack>

      <TextInput
        defaultValue={name}
        onChange={handleNameChange}
        label={t('account.myAccount.nameInput.label')}
        withVariableButton={false}
        debounceTimeout={0}
      />

      {/* <span>
        <TextInput
          type="email"
          defaultValue={email}
          onChange={handleEmailChange}
          label={t('account.myAccount.emailInput.label')}
          helperText={t('account.myAccount.emailInput.disabledTooltip')}
          withVariableButton={false}
          debounceTimeout={0}
          isDisabled
        />
      </span> */}

      <FormControl>
        <FormLabel>Email Address</FormLabel>
        <InputGroup>
          <Input type={'text'} defaultValue={email} pr="16" readOnly />
          <InputRightElement width="72px">
            <CopyButton textToCopy={email} size="xs" />
          </InputRightElement>
        </InputGroup>
        <FormHelperText>
          {t('account.myAccount.emailInput.disabledTooltip')}
        </FormHelperText>
      </FormControl>

      {/* {user && <ApiTokensList user={user} />} */}
    </Stack>
  )
}

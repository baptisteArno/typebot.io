import React, { useState } from 'react'
import {
  Button,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from '@chakra-ui/react'
import { EyeIcon, EyeOffIcon, CheckIcon } from '@/components/icons'
import { TypebotV6 } from '@typebot.io/schemas/features/typebot'

type PasswordProps = {
  updatePassword: (password: string) => Promise<TypebotV6 | undefined>
  existingPassword?: string
}

export const PasswordInput = ({
  updatePassword,
  existingPassword,
}: PasswordProps) => {
  const [password, setPassword] = useState(existingPassword || '')
  const [isPasswordVisible, togglePasswordVisibility] = useState(
    password ? false : true
  )
  const [isLoading, setIsLoading] = useState(false)
  const [
    isPasswordModificationSuccessful,
    setIsPasswordModificationSuccessful,
  ] = useState<undefined | boolean>(undefined)

  const onUpdatePassword = () => {
    setIsLoading(true)
    updatePassword(password)
      .then(() => {
        setIsPasswordModificationSuccessful(true)
        setIsLoading(false)
      })
      .catch(() => {
        setIsPasswordModificationSuccessful(false)
        setIsLoading(false)
      })
  }

  return (
    <HStack spacing={'0.9rem'} mt="3">
      <InputGroup w={56}>
        <Input
          type={isPasswordVisible ? 'text' : 'password'}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value.trim())
            setIsPasswordModificationSuccessful(undefined)
          }}
          isInvalid={
            password.trim().length < 6 ||
            isPasswordModificationSuccessful === false
              ? true
              : false
          }
          placeholder="Password"
          style={{
            borderColor: isPasswordModificationSuccessful ? 'green' : '',
          }}
        />
        <InputRightElement p="1">
          <Button
            variant="ghost"
            onClick={() => togglePasswordVisibility(!isPasswordVisible)}
            _hover={{ background: 'none' }}
          >
            {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
          </Button>
        </InputRightElement>
      </InputGroup>

      <Button
        isDisabled={password.length < 6}
        isLoading={isLoading}
        colorScheme={
          isPasswordModificationSuccessful == undefined
            ? 'blue'
            : isPasswordModificationSuccessful
            ? 'green'
            : 'red'
        }
        variant="solid"
        onClick={() => onUpdatePassword()}
      >
        <CheckIcon />
      </Button>

      {password === '' && <Text color="red.500">Password cannot be empty</Text>}
      {password.length > 0 && password.length < 6 && (
        <Text color="red.500">Password must be at least 6 characters long</Text>
      )}
    </HStack>
  )
}

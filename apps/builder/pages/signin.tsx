import { AuthSwitcher } from 'components/auth/AuthSwitcher'
import { SignInForm } from 'components/auth/SignInForm'
import { Heading, VStack } from '@chakra-ui/react'
import React from 'react'

const SignInPage = () => {
  return (
    <VStack spacing={4} h="100vh" justifyContent="center">
      <Heading>Sign in</Heading>
      <AuthSwitcher type="signin" />
      <SignInForm />
    </VStack>
  )
}

export default SignInPage

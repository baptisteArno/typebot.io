import { AuthSwitcher } from 'components/auth/AuthSwitcher'
import { SignInForm } from 'components/auth/SignInForm'
import { Heading, VStack } from '@chakra-ui/react'
import React from 'react'
import { Seo } from 'components/Seo'

const SignInPage = () => {
  return (
    <VStack spacing={4} h="100vh" justifyContent="center">
      <Seo title="Sign in" />
      <Heading>Sign in</Heading>
      <AuthSwitcher type="signin" />
      <SignInForm />
    </VStack>
  )
}

export default SignInPage
